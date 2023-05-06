import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from tqdm.notebook import tqdm
import pickle
import joblib


import numbers
from datasets import load_dataset
import random
from sklearn import metrics, model_selection, preprocessing
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset
import transformers
from transformers import AdamW, get_linear_schedule_with_warmup

from transformers import AutoTokenizer, BertModel
from transformers import XLNetTokenizer, XLNetModel

from dotmap import DotMap
from sklearn.metrics import f1_score, multilabel_confusion_matrix, confusion_matrix, ConfusionMatrixDisplay
from sklearn.model_selection import train_test_split
import seaborn as sns
import re
import gc
from sklearn import svm


# os.environ['CUDA_LAUNCH_BLOCKING'] = "1"
# torch.cuda.is_available() = True

class SelfAttentionPooling(torch.nn.Module):
    ''' Scaled Dot-Product Attention based Pooling '''

    def __init__(self, temperature, attn_dropout=0.1):
        super().__init__()
        self.temperature = temperature
        self.dropout = torch.nn.Dropout(attn_dropout)

    def forward(self, q, k, v, mask=None):
        attn = torch.matmul(q / self.temperature, k.transpose(1, 2))

        if mask is not None:
            attn = attn.masked_fill(mask == 0, -1e9)

        unnormalized_attn = attn
        attn_weights = F.softmax(unnormalized_attn, dim=-1)
        attn = self.dropout(attn_weights)
        output = torch.matmul(attn, v)

        return torch.sum(output, dim=1), unnormalized_attn # output, attention weight

class TriggerClassifier(torch.nn.Module):
    def __init__(self, n_train_steps, n_classes, sent_n_classes, do_prob, dim, model, sent_model):
        super().__init__()

        self.model = model
        self.sent_model = sent_model 

        self.dropout = nn.Dropout(do_prob)
        self.pooler = SelfAttentionPooling(temperature=768**0.5)
        self.fc1 = nn.Linear(768*2, 768)
        self.fc2 = nn.Linear(768, 768)

        self.out = nn.Linear(768, n_classes)
        self.sent_out = nn.Linear(768, sent_n_classes)
        self.softmax = nn.Softmax()
        self.sigmoid = nn.Sigmoid()
        self.relu = nn.ReLU()

        self.out_dv = nn.Linear(768, 1)
        self.out_suicide = nn.Linear(768, 1)
        self.out_ptsd = nn.Linear(768, 1)
        self.out_abusive = nn.Linear(768, 1)
        self.out_eating = nn.Linear(768, 1)
        self.out_others = nn.Linear(768, 1)

        # self.n_train_steps = n_train_steps
        # self.step_scheduler_after = "batch"

    def forward(self, ids, mask, sent_ids, sent_mask):
        output = self.model(ids, attention_mask=mask)["last_hidden_state"] # (B, seq_len, 768)
        sent_output = self.model(sent_ids, attention_mask=sent_mask)["last_hidden_state"]

        output = self.dropout(output)
        sent_output = self.dropout(sent_output)
        output, attn_weights = self.pooler(output + sent_output, output + sent_output, output + sent_output) # output = (B, 1, emb_size)
        sent_output, sent_attn_weights = self.pooler(sent_output, sent_output, sent_output)

        fin_rep = output
        sent_fin_rep = sent_output 

        sent_output = self.dropout(sent_output)
        sent_output = self.sent_out(sent_output)
        sent_output = self.softmaxs(sent_output)

        # import pdb; pdb.set_trace()

        output = self.fc1(torch.cat((fin_rep, sent_fin_rep), dim=1))
        output = self.relu(output) 
        output = self.fc2(output)
        output = self.relu(output) 
        output = self.dropout(output)
        output = self.out(output)

        # output_dv = self.out_dv(output)
        # output_suicide = self.out_suicide(output)
        # output_ptsd = self.out_ptsd(output)
        # output_abusive = self.out_abusive(output)
        # output_eating = self.out_eating(output)
        # output_others = self.out_others(output)

        # dv_prediction = self.sigmoid(output_dv)
        # suicide_prediction = self.sigmoid(output_suicide)
        # ptsd_prediction = self.sigmoid(output_ptsd)
        # abusive_prediction = self.sigmoid(output_abusive)
        # eating_prediction = self.sigmoid(output_eating)
        # others_prediction = self.sigmoid(output_others)

        # predictions = [
        #     dv_prediction, 
        #     suicide_prediction, 
        #     ptsd_prediction, 
        #     abusive_prediction,
        #     eating_prediction, 
        #     others_prediction
        # ]

        # import pdb; pdb.set_trace()

        # output = torch.stack(predictions)

        # return output, attn_weights, fin_rep, sent_output, sent_attn_weights
        return output, attn_weights, fin_rep, sent_output, sent_attn_weights

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
# modelDict = torch.load('best_dual_model__v2.pt',map_location=torch.device('cpu'))

selected_labels = [
                #    'SexualHarassment', 
                #    'domesticviolence',
                   'SuicideWatch', 
                   'ptsd', 
                   'abusiverelationships', 
                   'EatingDisorders',
                   'Others']

config = {
    'learning_rate': 5e-6,
    'batch_size': 32,
    'epochs': 15,
    'dropout': 0.5,
    'tokenizer_max_len': 100
}
config = DotMap(config)

sent_mapping = {
    0: "negative",
    1: "neutral",
    2: "positive"
}
mapping = {k:v for (k,v) in enumerate(selected_labels)}
n_labels = len(mapping)
sent_n_labels = len(sent_mapping)
n_train_steps = int(8544 / config.batch_size * 10)

# modelDict = torch.load('best_dual_model__v3.pt',map_location=torch.device('cpu'))
bert = BertModel.from_pretrained("bert-base-uncased")




# svm_model = joblib.load("svm.sav")
# vectorizer = pickle.load(open('tfidfvectorizer.pk', 'rb'))
# # loaded_model.transform('hi')
# text = vectorizer.transform(["helpadvice ive took a full pack of cocodamol 30mg500mg about 5 minutes ago whats going to happen to me"])
# pred = svm_model.predict(text)
# print(pred)
# model = TriggerClassifier(n_train_steps, n_labels-1, sent_n_labels, config.dropout, dim=768, model=bert, sent_model=bert)
# model.load_state_dict(modelDict)


def inference(text, model, device, tokenizer, max_len=100):
    model.eval()
    input = tokenizer(text, 
                      None, 
                      add_special_tokens=True,
                      max_length=max_len,
                      padding="max_length",
                      truncation=True)
    id = torch.tensor(input["inputs_ids"], dtype=torch.long)
    mask = torch.tensor(input["attention_mask"], dtype=torch.long)
    id = id.to(device)
    mask = mask.to(device)

    with torch.inference_mode():
        outputs, _, _, _, _ = model(ids=id, mask=mask, sent_ids=id, sent_mask=mask)

    return torch.sigmoid(outputs)

def labelText(inputText):
    svm_model = joblib.load("svm.sav")
    vectorizer = pickle.load(open('tfidfvectorizer.pk', 'rb'))
    transformedText = vectorizer.transform([inputText])
    label = svm_model.predict(transformedText)
    return label[0]

# output = inference("pain", model, device, tokenizer)
# out = labelText("helpadvice ive took a full pack of cocodamol 30mg500mg about 5 minutes ago whats going to happen to me")
# print(out)
# print("=========\n\n\n\n\n" + output + "=========")