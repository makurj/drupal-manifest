var data = {};

$(document).ready(function() {
    setup();
});

// search for a site in a specific docroot. Returns true if it is, and false if it is not.
function isInDocroot(docroot, site) {
    return ((Object.keys(docroot)).indexOf(site) > -1);
}

function searchDocroots(site) {
    var output = 'The site you entered is not in a listed docroot.';

    $.each(data.yamlArray['sites'], function(index, docroot) {
        if (isInDocroot(docroot, site.toLowerCase())) {
            output = index;
        }
    });

    var outbox = $('#outbox');
    outbox.addClass('bounce');
    setTimeout(function() {outbox.removeClass('bounce');}, 1000);

    outbox.html(output);
}

function fileToText(file) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
        return(reader.result);
    };
}

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                return(allText);
            }
        }
    }

    rawFile.send(null);
}

function setup() {
    try {
        readTextFile('.sites.yml');
        data.yamlArray = YAML.load('.sites.yml');
    }
    catch(e) {
        alert('An error occured with loading the Manifest file. Check the console for a more detailed error message.');
        console.log(e);
    }

    setTimeout(function() {$('#outbox').removeClass('bounce');}, 1000);
    var submit = $('#submit-textarea');
    var search = $('#site-search');
    submit.click(function(){
        searchDocroots($('#site-search').val());
    });
    search.bind("enterKey",function(e){
        searchDocroots($('#site-search').val());
    });
    search.keydown(function(e){
        if(e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });
}