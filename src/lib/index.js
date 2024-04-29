// place files you want to import through the `$lib` alias in this folder.
export function caseCorrectly(name) {
    return name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
}
