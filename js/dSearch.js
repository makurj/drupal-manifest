var data = {};

$(document).ready(function() {
    data = platformConfigGenerate();
    setTimeout(function() {$('#outbox').removeClass('bounce');}, 1000);
    filter_uiowa_domains_behavior_attach();

    var search = $('#site-search');
    search.keyup(function(){
        searchDocroots(search.val());
    });

    // Do this last.
    searchDocroots(search.val());
});

// Search for a site in a specific docroot. Returns array of matching docroots.
function isInDocroot(docroot, site) {
    var sites = Object.entries(docroot).filter(function(item, index) {
        var filter = item[0].indexOf(site) > -1;
        var filter_ui_domains = data.filter_ui_domains ? item[0].indexOf('uiowa.edu') < 0: true;
        return (filter && filter_ui_domains);
    });
    return sites;
}

// This function will search through the docroots to find sites that contain a given substring 'site'.
function searchDocroots(site) {
    var output = '';
    var sitelist = Array();

    $.each(data.yamlArray[data.index], function(index, docroot) {
        var sites = isInDocroot(docroot, site.toLowerCase());
        if (sites.length > 0) {
            sites.forEach(function(item){
                sitelist.push({'docroot':index, 'site':item[0], 'details':item[1]})
            })
        }
    });

    if(sitelist.length > 0){
        if (data.platform === 'D8') {
            output += D8Print(sitelist);
        }
        else if (data.platform === 'D7') {
            output += D7Print(sitelist);
        }
        else {
            console.log('Fatal Error: no platform detected, cannot print sites.');
        }
    }
    else{
        output = 'No sites found';
    }

    var outbox = $('#outbox');
    outbox.addClass('bounce');
    setTimeout(function() {outbox.removeClass('bounce');}, 1000);

    $('#outbox').html(output);
}

// Detect the platform we are on and return generated configuration for the search based on that.
function platformConfigGenerate() {
    var config = 'empty';

    if (config === 'empty') {
        // Check if it is D8;
        try {
            var yamlArray = YAML.load('manifest.yml');

            if (yamlArray != null) {
                // Generate config to pass to
                config = {
                    platform: 'D8',
                    index: 'applications',
                    yamlArray: yamlArray
                };

                console.log('Loaded D8 Manifest.');
            }
        } catch {}
    }

    if (config === 'empty') {
        // Check if it is D7;
        try {
            var yamlArray = YAML.load('sites.yml');


            if (yamlArray != null) {
                // Generate config to pass to
                config = {
                    platform: 'D7',
                    index: 'sites',
                    yamlArray: yamlArray
                };

                console.log('Loaded D7 Manifest.');
            }
        } catch {}
    }

    return config;
}

// This function is built for printing the body of D8 sites.
function D8Print(sitelist) {
    var output = '';

    sitelist.forEach(function(item){
        output += '<div class="site">';

        if(item.details.git != null) {
            var gitLink = 'https://github.com/uiowa/' + item.details.git;
            output += '<h2><a href="' + gitLink + '" rel="noopener noreferrer" target="_blank"><strong>' + item.site + '</strong></a></h2>';
        }
        else {
            output += '<h2><strong>' + item.site + '</strong></h2>';
        }

        output += '<div class = "site-info"><p><strong>Docroot:</strong> ' + item.docroot + '</p>';
        output += '<p><strong>Profile:</strong> ' + item.details.profile + '</p>';
        output += '<p><strong>Domains:</strong>'
        output += '<ul><li>Dev:' + item.details.domains.dev + '</li><li>Test:' + item.details.domains.test + '</li><li>Prod:' + item.details.domains.prod + '</li></ul>'
        output += '</p>';
        if(!$.isEmptyObject(item.details.redirects)) { output += '<p><strong>Redirects:</strong> ' + item.details.redirects + '</p>'; }
        output += '</div></div>';
    });

    return output;
}

// This function is built for printing the body of D7 sites.
function D7Print(sitelist) {
    var output = '';
    sitelist.forEach(function(item) {
        output += '<div class="site">';

        if(item.details.git != null) {
            var gitLink = 'https://' + item.details.git.slice(4, -4).replace(':','/');
            output += '<h2><a href="' + gitLink + '" rel="noopener noreferrer" target="_blank"><strong>' + item.site + '</strong></a></h2>';
        }
        else {
            output += '<h2><strong>' + item.site + '</strong></h2>';
        }

        output += '<div class = "site-info"><p><strong>Docroot:</strong> ' + item.docroot + '</p>';
        output += '<p><strong>Profile:</strong> ' + item.details.profile + '</p>';

        if (!$.isEmptyObject(item.details.domains)) {
            output += '<p><strong>Domains:</strong>'
            output += '<ul><li>Dev:' + item.details.domains.dev + '</li><li>Test:' + item.details.domains.test + '</li><li>Prod:' + item.details.domains.prod + '</li></ul>'
            output += '</p>';
        }
        if(!$.isEmptyObject(item.details.redirects)) { output += '<p><strong>Redirects:</strong> ' + item.details.redirects + '</p>'; }
        output += '</div></div>';
    });

    return output;
}

function filter_uiowa_domains_behavior_attach() {
    $('input[type=checkbox].switch_1').change(function() {
        data.filter_ui_domains = this.checked;
        searchDocroots($('#site-search').val());
    });
}