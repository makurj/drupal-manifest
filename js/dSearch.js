var data = {};

$(document).ready(function() {
    data.yamlArray = YAML.load('sites.yml');
    setTimeout(function() {$('#outbox').removeClass('bounce');}, 1000);

    var search = $('#site-search');
    search.keyup(function(){
        searchDocroots($('#site-search').val());
    });

});

// search for a site in a specific docroot. Returns array of matching docroots.
function isInDocroot(docroot, site) {
    var sites = Object.entries(docroot).filter(function(item, index){
        return item[0].indexOf(site) > -1
    })
    return sites;
}

function searchDocroots(site) {
    var output = '';
    var sitelist = Array();
    //Confirms the text box is not empty
    if(site){
        $.each(data.yamlArray['sites'], function(index, docroot) {
            var sites = isInDocroot(docroot, site.toLowerCase());
            if (sites.length > 0) {
                sites.forEach(function(item){
                    sitelist.push({'docroot':index, 'site':item[0], 'details':item[1]})
                })
            }
        });
    }

    if(sitelist.length > 0){
        sitelist.forEach(function(item){
            output += '<div class="site">';
            output += '<h2>' + item.site + '</h2>';
            output += '<div class = "site-info"><p><strong>Docroot:</strong> ' + item.docroot + '</p>';
            output += '<p><strong>Profile:</strong> ' + item.details.profile + '</p>';
            output += '<p><strong>Git:</strong> ' + item.details.git + '</p>';
            if (!$.isEmptyObject(item.details.domains)) {
                output += '<p><strong>Domains:</strong>'
                output += '<ul><li>Dev:' + item.details.domains.dev + '</li><li>Test:' + item.details.domains.test + '</li><li>Prod:' + item.details.domains.prod + '</li></ul>'
                output += '</p>';
            }
            if(!$.isEmptyObject(item.details.redirects)) { output += '<p><strong>Redirects:</strong> ' + item.details.redirects + '</p>'; }
            output += '</div></div>';
        })
    }
    else{
        output = 'No sites found';
    }

    var outbox = $('#outbox');
    outbox.addClass('bounce');
    setTimeout(function() {outbox.removeClass('bounce');}, 1000);

    $('#outbox').html(output);
}
