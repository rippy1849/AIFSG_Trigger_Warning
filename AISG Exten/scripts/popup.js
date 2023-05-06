
function openOptions(){

document.querySelector('#go-to-options').addEventListener('click', function() {
      window.open(chrome.runtime.getURL('options.html'));
    
    });
}