// This variable will hold the data needed for anything in this file.
// If you need to save something that any function across this file needs to access, add it to this variable.
var data = {};

$(document).ready(function() {
    // Run setup.
    setup();
});

// Perform setup operations.
function setup() {
    // Generate config and set variables in the data array.
    var config = platformConfigGenerate();
    data.platform = config.platform;
    data.index = config.index;
    data.yamlArray = config.yamlArray;

    // Attach behavior for the uiowa domains filter toggle.
    filter_uiowa_domains_behavior_attach();

    // Attach the
    var search = $('#site-search');
    search.keyup(function(){
        searchDocroots(search.val());
    });

    // Finally populate the sites and Initiate a bounce at the beginning to show that the page is loaded.
    // This should be done last to show that the search is ready to be used.
    searchDocroots(search.val());
    setTimeout(function() {$('#outbox').removeClass('bounce');}, 1000);
}

// Search for a site in a specific docroot. Returns array of matching docroots.
function isInDocroot(docroot, site) {
    var sites = Object.entries(docroot).filter(function(item, index) {
        // Check if the string given is in the site that is currently being looked at, and if it is allow the site to remain.
        var filter = item[0].indexOf(site) > -1;
        // Check if uiowa domains should be filtered out, if so, filter them out.
        var filter_ui_domains = data.filter_ui_domains ? item[0].indexOf('uiowa.edu') < 0: true;
        return (filter && filter_ui_domains);
    });
    // Return final sites array.
    return sites;
}

// This function will search through the docroots to find sites that contain a given substring 'site'.
function searchDocroots(site) {
    var output = '';
    var sitelist = Array();

    // Construct an array of more relevant data from the Yaml array that can then be digested by the rest of the function.
    $.each(data.yamlArray[data.index], function(index, docroot) {
        var sites = isInDocroot(docroot, site.toLowerCase());
        if (sites.length > 0) {
            sites.forEach(function(item){
                sitelist.push({'docroot':index, 'site':item[0], 'details':item[1]})
            })
        }
    });

    // Check if there are actually sites to print.
    if(sitelist.length > 0){
        // If there are sites to print, check what type of print function to call based on the platform.
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

    // Add bounce class to activate bounce animation so that the user knows the data is being filtered.
    var outbox = $('#outbox');
    outbox.addClass('bounce');
    setTimeout(function() {outbox.removeClass('bounce');}, 1000);

    // Add data to the output box.
    $('#outbox').html(output);
}

// Detect the platform we are on and return generated configuration for the search based on that.
function platformConfigGenerate() {
    var config = 'empty';

    if (config === 'empty') {
        // Check if it is D8;
        try {
            // Try and load the D8 manifest and then use that to determine the platform for the quick search.
            var yamlArray = YAML.load('manifest.yml');

            if (yamlArray != null) {
                // Generate config that will be returned by this function.
                config = {
                    platform: 'D8',
                    index: 'applications',
                    yamlArray: yamlArray
                };
            }
        } catch {}
    }

    if (config === 'empty') {
        // Check if it is D7;
        try {
            // Try and load the D7 manifest and then use that to determine the platform for the quick search.
            var yamlArray = YAML.load('sites.yml');

            if (yamlArray != null) {
                // Generate config that will be returned by this function.
                config = {
                    platform: 'D7',
                    index: 'sites',
                    yamlArray: yamlArray
                };
            }
        } catch {}
    }

    // Return the generated config from the above if(config ===) blocks.
    return config;
}

// This function is built for printing the body of D8 sites.
function D8Print(sitelist) {
    var output = '';

    // Prints this block for every site passed in.
    sitelist.forEach(function(item){
        output += '<div class="site">';

        // Makes the title a link to the git repo if there is a repo for it.
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

        // Checks for redirects and prints them if they exist.
        if(!$.isEmptyObject(item.details.redirects)) { output += '<p><strong>Redirects:</strong> ' + item.details.redirects + '</p>'; }
        output += '</div></div>';
    });

    return output;
}

// This function is built for printing the body of D7 sites.
function D7Print(sitelist) {
    var output = '';

    // Prints this block for every site passed in.
    sitelist.forEach(function(item) {
        output += '<div class="site">';

        // Makes the title a link to the git repo if there is a repo for it.
        if(item.details.git != null) {
            var gitLink = 'https://' + item.details.git.slice(4, -4).replace(':','/');
            output += '<h2><a href="' + gitLink + '" rel="noopener noreferrer" target="_blank"><strong>' + item.site + '</strong></a></h2>';
        }
        else {
            output += '<h2><strong>' + item.site + '</strong></h2>';
        }

        output += '<div class = "site-info"><p><strong>Docroot:</strong> ' + item.docroot + '</p>';
        output += '<p><strong>Profile:</strong> ' + item.details.profile + '</p>';

        // Checks for domains and prints them if they exist.
        if (!$.isEmptyObject(item.details.domains)) {
            output += '<p><strong>Domains:</strong>'
            output += '<ul><li>Dev:' + item.details.domains.dev + '</li><li>Test:' + item.details.domains.test + '</li><li>Prod:' + item.details.domains.prod + '</li></ul>'
            output += '</p>';
        }

        // Checks for redirects and prints them if they exist.
        if(!$.isEmptyObject(item.details.redirects)) { output += '<p><strong>Redirects:</strong> ' + item.details.redirects + '</p>'; }
        output += '</div></div>';
    });

    return output;
}

// Attaches a filter behavior to the toggle
function filter_uiowa_domains_behavior_attach() {
    $('input[type=checkbox].switch_1').change(function() {
        data.filter_ui_domains = this.checked;
        searchDocroots($('#site-search').val());
    });
}