let filePhoneNumbers = fetch("https://github.com/Adrenotoruz/Wyszukiwarka-teleadresowa/data/phoneNumbers.json");
let body         = document.getElementsByTagName("body");
let searchInput  = document.getElementById("searchInput");
let searchButton = document.getElementById("searchButton");
let searchValue;
let jsonData;
let result;
const dictionary = {
    number     : "Numer bazowy",
    internal   : "Numer wewnętrzny",
    person     : "Osoba",
    workTitle  : "Stanowisko pracy",
    department : "Dział",
    description: "Opis",
    oldNumber  : "Stary numer",
    tags       : "Kategorie"
};

const doesTableExist = () => {
    // checks if table exists
    let takenTable = document.getElementById("HtmlTable");
    if (!(takenTable == undefined))
        takenTable.parentNode.removeChild(takenTable);
};

const createTable = () => {
    // creates table, adds style classes and id
    let functionTable    = document.createElement("TABLE");
        functionTable.id = "HtmlTable";
    functionTable.classList.add("table-striped");
    functionTable.classList.add("table-bordered");
    functionTable.classList.add("tablesorter");
    functionTable.width = "100%";
    return functionTable;
};

const eliminateDiacretics = e => {
    return e
        .replace("ą", "a")
        .replace("Ą", "A")
        .replace("ć", "c")
        .replace("Ć", "C")
        .replace("ę", "e")
        .replace("Ę", "E")
        .replace("ł", "l")
        .replace("Ł", "L")
        .replace("ń", "n")
        .replace("Ń", "N")
        .replace("ó", "o")
        .replace("Ó", "O")
        .replace("ś", "s")
        .replace("Ś", "S")
        .replace("ż", "z")
        .replace("Ż", "Z")
        .replace("ź", "z")
        .replace("Ź", "Z");
};

const filterJSON = objJsonData => {
    // takes data from JSON file which is in given parameter, then filter data. If elements have an empty Number value, excludes them and then filter data with value from input and returns filtered array
    let filteredJsonData = objJsonData.filter(e => {
        if (!(e.Number == "")) return e;
    });
    let options = {
        tokenize      : true,
        matchAllTokens: true,
        threshold     : 0.15,
        keys          : []
    };
    let objectKeys = Object.keys(filteredJsonData[0]);
    for (index in objectKeys) {
        options.keys.push(objectKeys[index]);
    }

    let nonDiacreticsArray = filteredJsonData.map(e => {
        let obj = JSON.parse(JSON.stringify(e));
        for (property in obj) {
            obj[property] = eliminateDiacretics(obj[property]);
        }
        return obj;
    });
    let nonDiacreticSearchValue;
    if (!(searchValue == undefined)) {
        nonDiacreticSearchValue = eliminateDiacretics(searchValue);
    }
    let fuse                       = new Fuse(nonDiacreticsArray, options);
    let nonDiacreticsfilteredArray = fuse.search(nonDiacreticSearchValue);
    let indexes                    = [];
    for (let i = 0; i < nonDiacreticsfilteredArray.length; i++) {
        indexes.push(nonDiacreticsArray.indexOf(nonDiacreticsfilteredArray[i]));
    }
    let diacreticsFilteredArray = [];

    for (let i = 0; i < indexes.length; i++) {
        diacreticsFilteredArray.push(filteredJsonData[indexes[i]]);
    }
    return diacreticsFilteredArray;
};

const fillTable = (array, table, isThead, isTbody) => {
    // fills table with values of array. Checks if need to create Thead or Tbody
    let prop;
    let cell;
    let tableRow;
    let thead;
    let tbody;
    let tbodyId;
    if (isThead) {
        array    = Object.values(dictionary);
        thead    = table.createTHead();
        tableRow = thead.appendChild(document.createElement("tr"));
    } else if (isTbody) {
        tbody    = table.createTBody();
        tbody.id = "tbody";
        tableRow = tbody.appendChild(document.createElement("tr"));
    } else {
        tbodyId  = document.getElementById("tbody");
        tableRow = tbodyId.appendChild(document.createElement("tr"));
    }
    for (let j = 0; j < array.length; j++) {
        prop = document.createTextNode(`${array[j]}`);
        if (isThead) {
              cell      = tableRow.appendChild(document.createElement("th"));
            } else cell = tableRow.appendChild(document.createElement("td"));
        cell.appendChild(prop);
    }
};

const loadItems = () =>
    // loads data from JSON file and then creates HTML Table with filtered elements
    filePhoneNumbers
        .then(response => response.clone().json())
        .then(data => (jsonData = data.PhoneList))
        .then(() => (result = filterJSON(jsonData)))
        .then(() => {
            doesTableExist();
            let table = createTable();
            for (let i = 0; i < result.length; i++) {
                if (i === 0) {
                    fillTable(Object.keys(result[i]), table, true, false);
                    fillTable(Object.values(result[i]), table, false, true);
                    body[0].appendChild(table);
                } else fillTable(Object.values(result[i]), table, false, false);
            }

            $(document).ready(() => {
                $("#HtmlTable").tablesorter({ sortList: [[2, 0]] });
            });
            searchValue = "";
        })
        .catch(error => {
            window.alert(error);
        });

const updateTable = () => {
    // updates Table when input value is changed
    searchValue = searchInput.value.trim();
    loadItems();
};

searchInput.addEventListener("input", updateTable);

window.onload = loadItems();  // Initial whole Data load excepts empty Objects when page is firstly loaded
