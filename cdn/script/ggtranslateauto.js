function createCookie(name, value, days, domain) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else {
        var expires = "";
    }
    document.cookie = name + "=" + value + expires + "; domain=" + domain + "; path=/";
}

function eraseCookie(name, domain) {
    createCookie(name, "", -1, domain);
}

fetch('https://ipinfo.io/json')
    .then(response => response.json())
    .then(data => {
        if (data?.country !== "VN") {
            createCookie('googtrans', '/vi/en', 1, '.toolsclub.net');
        } else {
            eraseCookie("googtrans", ".toolsclub.net");
            eraseCookie("googtrans", "");
        }
        console.log(`Your Country: ${data.country}`);
    })
    .catch(error => {
        console.log('Error fetching country:', error);
    });

function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'vi',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        includedLanguages: 'en,vi,zh-CN,hi,es,ru'
    }, 'google_translate_element');
}

var googleTranslateScript = document.createElement('script');
googleTranslateScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
document.body.appendChild(googleTranslateScript);