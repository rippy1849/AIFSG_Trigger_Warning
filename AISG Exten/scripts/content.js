backendURL = 'http://localhost:8080';
addSpoilerClass();
addBannerClass();
addSettingsBar();

labelMap = {SuicideWatch: "afsgSpoilerSW", ptsd: "afsgSpoilerPTSD", abusiverelationships: "afsgSpoilerAR", EatingDisorders: "afsgSpoilerED", Others: "afsgSpoilerOther"};

/*
=====================================================================================================
THIS IS UNIMPLEMENTED CODE FOR PROPERLY DISPLAYING SETTINGS RELATIVE TO CHROME SESSION STORAGE VALUES
=====================================================================================================
*/
function setOptionsValue(label, val){
  opt1 = document.getElementById(label);
  // console.log(opt1);
  opt1.value = val;

} 
function toggleSetting(label){

  // console.log("Pain");
  chrome.storage.local.get([label], (result) => {
    
      if (result == null){
        console.log("Invalid Setting Value, Fail Safe True");
        var fsDefault = {};
        fsDefault[label] = true;
  
        setOptionsValue(label, "1");


        chrome.storage.local.set(fsDefault).then(() => {
        });
        
      }else{
  
      if(result[label] == true){
        // console.log("pain true");
        var fsDefault = {};
        fsDefault[label] = false;
        setOptionsValue(label, "0");

        chrome.storage.local.set(fsDefault).then(() => {
        });

      }else{
        // console.log("pain false",label);
        
        var fsDefault = {};
        fsDefault[label] = true;
        setOptionsValue(label, "1");
        

        chrome.storage.local.set(fsDefault).then(() => {
        });

      }
  
    }
  
  });


}
//Hash the post content ID (to avoid security issues & hide data sent.) Useless to implement unless the 
//other security issues get fixed.
function hash(string) {
  const utf8 = new TextEncoder().encode(string);
  return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  });
}
/*
=====================================================================================================
END UNIMPLEMENTED CODE
=====================================================================================================
*/

/*
=====================================================================================================
------------------------------------BEGIN FUNCTION DECLARATIONS--------------------------------------
=====================================================================================================
*/

/*
Function: addSettingsBar() Overview
==================================================================================================
Input Params: None
Output Params: None
==================================================================================================
Function Description:
--------------------------------------------------------------------------------------------------
Adds add toggle dropdown for each of the five spoiler types:
Suicide Watch, PTSD, Abusive Relationships, Eating Disorders, and Others.
Adds a AIFSG Banner at the top. Note, this may not appear on every page due to per-page style CSS.
==================================================================================================
*/
function addSettingsBar(){


  // settingsHeader is the container div to hold the settings and the banner.
  var settingsHeader = document.createElement("div");
  settingsHeader.style.height = "200px";
  settingsHeader.style.width = "100%";

  // bannerDiv is the container div to hold the AIFSG image banner.
  var bannerDiv = document.createElement("div");
  bannerDiv.setAttribute("class","aisgfill");
  bannerDiv.style = "height:100px;width:100%;background-image:url(https://i.imgur.com/BXx2YYN.png)";
  settingsHeader.appendChild(bannerDiv);

  // options<n> is a select HTML element that contains either <LABEL> + <Enabled> or <Disabled>.
  option1 = createDropDown("Suicide Watch: ","afsgSpoilerSW");
  option2 = createDropDown("PTSD: ","afsgSpoilerPTSD");
  option3 = createDropDown("Abusive Relationships: ","afsgSpoilerAR");
  option4 = createDropDown("Eating Disorders: ","afsgSpoilerED");
  option5 = createDropDown("Other: ","afsgSpoilerOther");
  option6 = createDropDown("Lock Settings: ","afsgSettingLock");

  // Appends each select HTML to the settingsHeader div container.
  settingsHeader.appendChild(option1);
  settingsHeader.appendChild(option2);
  settingsHeader.appendChild(option3);
  settingsHeader.appendChild(option4);
  settingsHeader.appendChild(option5);
  settingsHeader.appendChild(option6);

  // Injects the settingsHeader div container into the page body, at the very top of the list.
  document.body.prepend(settingsHeader);
}

/*
Function: createDropDown() Overview
==================================================================================================
Input Params:
-- headerLabel: The visual text to be displayed in the <select> HTML element
-- label: The id attributed to be attatched to the <select> HTML element

Output Params:
-- outputSelect: The packaged <select> HMTL element that contains the respective options
==================================================================================================
Function Description:
--------------------------------------------------------------------------------------------------
Module to generate a <select> HTML element based on the input, has two options: "<headerLabel> Enabled", "<headerLabel> Disabled"
==================================================================================================
*/
function createDropDown(headerLabel, label){

  //Creates the <option> element for the "<headerLabel> Enabled" option of the <select> element
  var enabledOption = document.createElement("option");
  enabledOption.value = "1";
  enabledOption.innerHTML = headerLabel + " Enabled";

  //Creates the <option> element for the "<headerLabel> Disabled" option of the <select> element
  var disabledOption = document.createElement("option");
  disabledOption.value = "0";
  disabledOption.innerHTML = headerLabel + " Disabled";

  //Creates the <select> element and sets the options attribute to the two aforementioned <option> elements
  var outputSelect = document.createElement("select");
  outputSelect.id = label;
  outputSelect.options.add(enabledOption);
  outputSelect.options.add(disabledOption);
  

  return outputSelect

}

/*
Function: grabSetting() Overview
==================================================================================================
Input Params:
-- label: The respective spoiler id corresponding to the label, ie, "afsgSpoilerSW" indicates the Sucicide Watch Label
-- text: The label's corresponding HTML element. ie, a <p>, or <hn> element.

Output Params: None
==================================================================================================
Function Description:
--------------------------------------------------------------------------------------------------
Module to grab the chrome.session.local setting corresponding to the label, then apply the spoiler
==================================================================================================
*/
function grabSetting(label,textElement){

  //Checks the local chrome storage for the <true/false> resulting from the <label> key.
  chrome.storage.local.get([label], (result) => {
    

    /*
    Case in which the value has yet to be set. Present when launching the app for the first time
    and settings have yet to populate. Fail Safe Default is to hide everything and hide the text.
    */ 
    if (result == null){

      console.log("Invalid Setting Value, Fail Safe True.");
      var fsDefault = {};
      fsDefault[label] = true;

      hideText(label,textElement);

      chrome.storage.local.set(fsDefault).then(() => {

        console.log("Populated Initial Settings to FSD of hide.");
      });
      
    }else{


    if(result[label] == true){
      /*
      Case where the setting existed and was enabled. Hides the respective label's text.
      */
      hideText(label,textElement);

      return true;
    }else{
      /*
      Case where the setting existed and was disabled. Does not hide the label's text.
      */
      return false;
    }

  }

});

}


/*
Function: hideText() Overview
==================================================================================================
Input Params:
-- label: The respective spoiler id corresponding to the label, ie, "afsgSpoilerSW" indicates the Sucicide Watch Label.
-- text: The label's corresponding HTML element. ie, a <p>, or <hn> element.

Output Params: None
==================================================================================================
Function Description:
--------------------------------------------------------------------------------------------------
Module to apply the colored spoiler to the text element. Each color corresponds to the awareness
color for the respective label. Creates a new span class based on the .aifsgSpoilerClass CSS 
injected at the head of the page. See addSpoilerClass() documentation.
==================================================================================================
*/
function hideText(label, text){

  //Create the <span> HTML element to replace the text element.
  var replaced = document.createElement("span");

  //and set the class to respective spoiler. (Per-label class specifying).
  replaced.setAttribute("class",label);

  //Grabs the innerHTML of the original text element to insert into the newly create <span> element.
  var oldP = text.innerHTML;

  //Set the new <span> element's innerHTML to the old text element's.
  replaced.innerHTML = oldP;

  //Replace (and delete the old text element) with the newly created <span> element
  text.replaceWith(replaced);

}

/*
Function: iterateList() Overview
==================================================================================================
Input Params:
-- eleList: The input element list to be parsed and labeled. 

Output Params: None
==================================================================================================
Function Description:
--------------------------------------------------------------------------------------------------
Takes the extracted list of text-based elements in the page. This is an HTML collection of html
elements such as <p> or <hn> elements. For each element, it applies a consecutive numbering id label
of the form "text<i>". In addition to this, for each element, an <iframe> element is created whose
source is the backendURL with the following query:
?name=(text content)
?id=i
This was done to circumvent Chrome's https to http policy red tape, since without this, jquery is 
not allowed, nor is normal cross-origin querying. For some reason, iframes ignore this and allow
the extension to interface with the WebPy backend server. In addition, many pages present defenses
for injecting known scripts such as jquery into their pages, so this avoids tripping their sensors.
==================================================================================================
*/
function iterateList(eleList){

  //Iterate over each HTML element in the list.
  for (let i = 0; i < eleList.length; i++) {
    //Create the query iframe.
    var iframe = document.createElement('iframe');

    //Compose the query URL for each iframe based on the textContent(name) and the elementID.
    iframe.src = backendURL + "?name=" + eleList[i].textContent + "&id=" + i;

    //Label the iframe to make extracting information from it easier later.
    iframe.id = "frame" + i;

    //Label the text element to make finding and removing it easier later.
    eleList[i].id = "text" + i;

    //Inject the iframe into the page.
    document.body.appendChild(iframe);
}

}

/*
Function: grabText() Overview
==================================================================================================
Input Params: None

Output Params:
--merged: The merged element list of all text-based elements to label and hide.
==================================================================================================
Function Description:
--------------------------------------------------------------------------------------------------
Crawls the page looking for text-based elements label and hide. Can be expanded to allow for more
flexibility from page to page. Returns a merged HTML collection list of all found elements.
==================================================================================================
*/
function grabText(){
  //Grabs all loaded <p> HTML elements.
  textElements = document.querySelectorAll('p');

  //Grabs all loaded <h3> HTML elements.
  headerElements = document.querySelectorAll('h3');

  //Merges the element lists into a HTML collection to be parsed and labeled.
  var merged = [...textElements, ...headerElements];

  return merged;
}

/*
Function: addSpoilerClass() Overview
==================================================================================================
Input Params: None
Output Params: None
==================================================================================================
Function Description:
--------------------------------------------------------------------------------------------------
Injects a CSS class for each respective spoiler label type; Suicide Watch, PTSD, Abusive Relationships
Eating Disorders, and Others. The format for each class is specified by a unique name, .afsgSpoiler<label>,
to avoid overloaded page labeling, as we are injecting this ontop of an already exisiting page. Due to the 
highly unpredictable nature of each page's <head> and exisiting <style> elements, there are some visual
issues present.
==================================================================================================
*/
function addSpoilerClass(){

  /* 
  Creates each spoiler CSS class to be injected at the <head>.
  Each spoiler class's spoiler color is the awareness color for that label.
  The HEX color code + the label are as follows:
  HEX     |     Descripition
  --------|------------------------
  #4287f5 - Blue, for Suicide Watch.
  #008080 - Turquoise, for PTSD.
  #663399 - Purple, for Abusive Relationships/Domestic Violence. Fun fact, Rippy dressed up in this color in drag his freshman year
  to raise money and awareness on this exact subject. #PLUM LIVES ON. :D 
  #C8A2C8 - Lilac, for Eating Disorders
  #000000 - Black, for Others (Uncategorized)
  */
  var spoilerClass1 = document.createElement("style");
  spoilerClass1.innerHTML = ".afsgSpoilerSW { background-color: #4287f5; color: #4287f5; } .afsgSpoilerSW:hover { background-color: #E9E9DF;}";

  var spoilerClass2 = document.createElement("style");
  spoilerClass2.innerHTML = ".afsgSpoilerPTSD { background-color: #008080; color: #008080; } .afsgSpoilerPTSD:hover { background-color: #E9E9DF;}";

  var spoilerClass3 = document.createElement("style");
  spoilerClass3.innerHTML = ".afsgSpoilerAR { background-color: #663399; color: #663399; } .afsgSpoilerAR:hover { background-color: #E9E9DF;}";

  var spoilerClass4 = document.createElement("style");
  spoilerClass4.innerHTML = ".afsgSpoilerED { background-color: #C8A2C8; color: #C8A2C8; } .afsgSpoilerED:hover { background-color: #E9E9DF;}";

  var spoilerClass5 = document.createElement("style");
  spoilerClass5.innerHTML = ".afsgSpoilerOther { background-color: black; color: black; } .afsgSpoilerOther:hover { background-color: #E9E9DF;}";

  //Injects each of the respective classes into the head element.
  document.head.appendChild(spoilerClass1);
  document.head.appendChild(spoilerClass2);
  document.head.appendChild(spoilerClass3);
  document.head.appendChild(spoilerClass4);
  document.head.appendChild(spoilerClass5);
}

/*
Function: addBannerClass() Overview
==================================================================================================
Input Params: None
Output Params: None
==================================================================================================
Function Description:
--------------------------------------------------------------------------------------------------
Injects a CSS class for the AIFSG group banner (Andrew Rippy, Klaijan Sinteppadon, Olivia Xu). Fun fact, the gradient colors of this 
banner are the awareness colors for each of the labels that the model labels.
==================================================================================================
*/
function addBannerClass(){
  //Creates the <style> element to put the CSS class into.
  bannerClass = document.createElement("style");
  bannerClass.innerHTML = ".aisgfill { background-size: cover; background-position: center; width: 100%; height: 100%}"

  //Injects the class into the <head> of the document.
  document.head.appendChild(bannerClass);
}

/*
Function: addBannerClass() Overview
==================================================================================================
Input Params: None
Output Params: None
==================================================================================================
Function Description:
--------------------------------------------------------------------------------------------------
Based on whether or not the settingsLock options is enabled or disabled, updates the chrome extension's
local storage on whether or not to hide the labels to the settings chosen by the user at the top of
the screen. It is done in this manner to avoid script injection and satisfy non-interference.
==================================================================================================
*/
function updateSettings(){

  //Checks to see if the settings should be changed. 
  shouldUpdate = document.getElementById("afsgSettingLock").value;

  //If the lock is disabled, update the settings to their onscreen values.
  if (shouldUpdate == "0"){

    //Grab each drop-down's values (1 = Enabled, 0 = Disabled).
    valSW = document.getElementById("afsgSpoilerSW").value;
    valPTSD = document.getElementById("afsgSpoilerPTSD").value;
    valAR = document.getElementById("afsgSpoilerAR").value;
    valED = document.getElementById("afsgSpoilerED").value;
    valO = document.getElementById("afsgSpoilerOther").value;

    //Set the value of the setting in chrome.storage.local
    setValue("afsgSpoilerSW", valSW);
    setValue("afsgSpoilerPTSD", valPTSD);
    setValue("afsgSpoilerAR", valAR);
    setValue("afsgSpoilerED", valED);
    setValue("afsgSpoilerOther", valO)

  }

}

/*
Function: setValue() Overview
==================================================================================================
Input Params:
-- label: The key for the chrome.storage.local value to be set.
-- val: The value to set the chrome.storage.local key's value to.
Output Params: None
==================================================================================================
Function Description:
--------------------------------------------------------------------------------------------------
A wrapper function for the chrome.storage.local API to set the key-value pair of the respective 
label (key) value (true/false) pair. 
==================================================================================================
*/
function setValue(label, val){

  //Set the value to true.
  if (val == "1"){
    var fsDefault = {};
    fsDefault[label] = true;
    chrome.storage.local.set(fsDefault).then(() => {
      // console.log("Set to true");
    });

  }else{
    //Set the value to false.
    var fsDefault = {};
    fsDefault[label] = false;
    chrome.storage.local.set(fsDefault).then(() => {
      // console.log("Set to false");

    });


  }

}

/*
Function: makeSpoiler() Overview
==================================================================================================
Input Params:
-- text: The HTML text element to be hidden.
-- label: The label corresponding the to text element.
Output Params: None
==================================================================================================
Function Description:
--------------------------------------------------------------------------------------------------
A wrapper function to handle the null case (invalid query).
==================================================================================================
*/
function makeSpoiler(text,label){
  if (text == null) {
    return;
  }

  grabSetting(labelMap[label],text);

}

/*
=====================================================================================================
------------------------------------END FUNCTION DECLARATIONS----------------------------------------
=====================================================================================================
*/




/*
This injects an eventListener into the page. This is the handler for the postMessage(DATA) that is sent
by each of the respective iframes. It recieves essentially an "I recieved your text, here's a label + the respective ID".
The ID is used to find the orginal text element the label corresponded to. It then determines whether or not to 
hide the text content, and removes the iframe, to avoid unncessary loads. This parallelizes the page labeling, at the cost
of opening more loaded iframes. Again, if you're shaking your head at how stupid this sounds, I will remind you of the 
following:
1) Simply sending postMessage() instead of loading the page is impossible due to https --> http
2) Using jquery is not possible due to security policy AND page various defenses at injecting jquery into the site.
So yes, it's stupid, but it WORKS. -_-
*/
window.addEventListener('message', function(event) {

  //Security is good. Confirm it comes from the expected origin. (The WebPy Backend)
  if (event.origin !== backendURL){return;}

  //Unpack the data into the ID and the label.
  recOut = (event.data).split(",");

  //Use the ID to find the already ID'ed text and iframe elements.
  textID = "text" + recOut[0];
  frameID = "frame" + recOut[0];
  //Grab the label
  label = recOut[1];

  //We no-longer need the iframe element. Remove it.
  frame = this.document.getElementById(frameID);
  frame.remove();
  
  //Grab the text element, and hide it or don't. 
  text = this.document.getElementById(textID);
  makeSpoiler(text,label);

});



//Crawl the page ONLOAD
textElements = grabText();
iterateList(textElements);


//Re-Crawl the pagee every 3 seconds to find newly loaded content
setInterval(function(){
textElements = grabText();
iterateList(textElements); 

},3000);

//Update the settings for the extension based on the dropdown. Avoids script injection via a button.
setInterval(function(){ updateSettings(); },1000);
