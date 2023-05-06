import web
import os
from pathlib import Path
import test
import model

'''
This is the WebPy backend to interface with the chrome extension.
I have left a small amount of residual debugging functions and variables 
to make building upon it later easier, as they are structural placeholders.
'''


'''
Debugging import placeholders
'''
def runModel():
    return test.WAF()

def whoAlwaysFights(name=''):
    return name + " Always Fights"


'''
The allowed rendering list for allowed html Pages. I'm afraid to comment the index.html
due to it being a chimeara of python, javascript, and html. You have been warned if
you try to add anything to it, be ready for 3 languages worth of error interpreting.
'''
urls = (
    '/(.*)','index'
)


'''
Load the template directory. Can be useful for more pages and entire python-webserved
websites applications, etc.
'''
templatePath = Path.cwd()
templatePath = templatePath / "templates/"

render = web.template.render(templatePath,globals={'runModel': runModel})

app = web.application(urls, globals())



'''
The main interpreter for the extension data. "name" contains the ?name and ?id
queries sent by the extension. They are printed out for eventLogging and 
debugging.
'''

class index:
    def GET(self, name):
        input = web.input()

        inputDict = dict(input)
        print(inputDict)
        
        parsed = None
        
        parsed = inputDict["name"]
        id = inputDict["id"]
        outName = model.labelText(parsed)
        outName = id + "," + outName

        return render.index(name=outName)


if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
