export { init };

const $search = document.querySelector('#search input');
const validKeys = /[a-z0-9-\.,:;!\(\)\[\]'"]/i;

addEventListener('popstate', init); // window history change
document.addEventListener('keydown', refocus); // catch [escape] & key presses outside $search
$search.addEventListener('input', filter);
$search.addEventListener('blur', updateHistory);

function init(event) {
    const urlParams = new URLSearchParams(location.search);
    let value = '';

    for(const param of urlParams) {
        value += ' '+ param[0];
    }

    $search.value = value.substring(1).toLowerCase(); // cut off initial ?

    filter();
}

function refocus(event) {
    // check for [space], [backspace], letters, numbers and some special chars
    const isValidKey = event.code === 'Space' || event.code === 'Backspace' || event.key.length === 1 && validKeys.test(event.key);

    if (event.target !== $search && isValidKey) {
        $search.setSelectionRange($search.value.length, -1);
        $search.focus(); // now input event triggers filter()
    }

    if (event.code === 'Escape') {
        $search.value = '';
        $search.blur();
        filter();
    }
}

function filter(event) {
    updateHistory();

    document.querySelectorAll('.project-card').forEach($element => {
        let hasNoMatch = $search.value.trim() !== '';

        const title = $element.querySelector('.project-title').textContent.toLocaleLowerCase();
        const desc = $element.querySelector('.project-desc').textContent.toLocaleLowerCase();
        const tags = $element.querySelector('.project-tags').textContent.toLocaleLowerCase();

        iterateSearchTerms(term => {
            hasNoMatch &= !(title.includes(term) || desc.includes(term) || tags.includes(term));
        });

        $element.style.display = hasNoMatch ? 'none' : 'grid';
    });
}

function updateHistory(event) {
    let params = '';

    iterateSearchTerms(term => {
        params += '&'+ term;
    });

    history.pushState(null, '', params === '' ? './' : params.replace('&', '?'));
}

function iterateSearchTerms(lamda) {
    $search.value.toLocaleLowerCase().split(/\s+/).forEach(term =>{
        if (term.length === 0) { return; }

        lamda(term);
    });
}