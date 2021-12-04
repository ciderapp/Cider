try {
    function matchRuleShort(str, rule) {
        var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
    }
    if(AMJavaScript.getQuery("amesettings")) {
        if (!storedInnerHTML && document.getElementsByTagName('footer').length !== 0) {
            var storedInnerHTML = document.getElementsByTagName('footer')[0].innerHTML;
        }

        if (matchRuleShort(window.location.href, '*settings*') && document.getElementsByClassName('application-preferences').length === 0) {
            AMSettings.CreateMenu('commerce-full-content');
        } else if (document.getElementsByTagName('footer').length === 1) {
            document.getElementsByTagName('footer')[0].innerHTML = storedInnerHTML; /* Revert the footer */
        }
    }
} catch (e) {
    console.error("[JS] Error while trying to apply settingsPage.js", e);
}