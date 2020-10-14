// TODO: 
var cardArray = [];

const userAction = async () => {
    await fillCards();
    generateHtml();
}

async function fillCards() {
    const response = await fetch('https://www.dnd5eapi.co/api/classes/druid/spells');
    const myJson = await response.json(); //extract JSON from the http response
    var results = myJson.results;

    console.log(myJson);

    const promises = results.map(async spell => {
        const spellList = await addCard(spell.url)
        return spellList
    })
    
    await Promise.all(promises)

    console.log(cardArray);
}

async function addCard(url) {
    const response = await fetch('https://www.dnd5eapi.co'+url);
    const card = await response.json(); //extract JSON from the http response
    cardArray.push(card);
}

function generateHtml() {
    var body = document.getElementsByTagName("BODY")[0];
    body.innerHTML = "";

    //var page = null;
    //var row = null;

    var virtpages = [];
    let remainder = (8 - (cardArray.length)%8)%8;
    for (let i = 0; i < cardArray.length + remainder; i++) {
        var pg = Math.floor(i/8);
        var vrow = Math.floor((i%8)/4);
        var vcol = i%4;

        if (i%8==0) {
            virtpages[pg] = [];
        }
        if (i%4==0) {
            virtpages[pg][vrow] = []
        }
        if (i >= cardArray.length) {
            // just reuse the last card I guess, who cares
            virtpages[pg][vrow][vcol] = cardArray[cardArray.length-1];
        } else {
            virtpages[pg][vrow][vcol] = cardArray[i];
        }
    }

    virtpages.forEach(vpage => {
        let page = document.createElement("DIV");
        page.classList.add("page");

        vpage.forEach(vrow => {
            let row = document.createElement("DIV");
            row.classList.add("row");
            page.appendChild(row);

            vrow.forEach(spell => {                
                // create a card and append to row
                let card = generateFronts(spell);
                row.appendChild(card);
            });
        });
        
        body.appendChild(page);
    });

    // and back pages
    virtpages.forEach(vpage => {
        let page = document.createElement("DIV");
        page.classList.add("page");

        vpage.forEach(vrow => {
            let row = document.createElement("DIV");
            row.classList.add("row");
            page.appendChild(row);

            vrow.forEach(spell => {                
                // create a card and append to row
                let card = generateBacks(spell);
                row.prepend(card);
            });
        });
        
        body.appendChild(page);
    });
}

function lvToNumerals(level) {
    switch(level) {
        case 0: return "Cantrip";
        case 1: return "I";
        case 2: return "II";
        case 3: return "III";
        case 4: return "IV";
        case 5: return "V";
        case 6: return "VI";
        case 7: return "VII";
        case 8: return "VIII";
        case 9: return "IX";
    }
}

function generateBacks(spell) {
    // build card
    var card = document.createElement("DIV");
    card.classList.add("card", "backface");

    var level = document.createElement("DIV");
    level.classList.add("back-level")
    level.innerText = lvToNumerals(spell.level);

    var school = document.createElement("DIV");
    school.classList.add("back-school");
    school.innerText = spell.school.name;

    var set = document.createElement("DIV");
    set.classList.add("back-set");
    set.innerText = "for a druid's eyes only";

    card.append(level);
    card.append(school);
    card.append(set);

    return card;
}


function generateFronts(spell) {
    amendDescription(spell);

    // build card
    var card = document.createElement("DIV");
    card.classList.add("card");

    // build header
    var header = document.createElement("DIV");
    header.classList.add("header-section");

    // build title
    var title = document.createElement("DIV");
    title.classList.add("spell-name");
    title.innerText = spell.name;

    // build meta
    var meta = document.createElement("DIV");
    meta.classList.add("meta");
    if (spell.level == 0) {
        meta.innerText = "Druid - " + spell.school.name + " Cantrip";
    } else {
        meta.innerText = "Druid - Level " + spell.level + " " + spell.school.name + " Spell";
    }

    var componentText = "";
    for (let i = 0; i < spell.components.length; i++) {
        if (i != 0) {
            componentText += "∗";
        }
        componentText += spell.components[i];
    }
    meta.innerHTML += "<span class='components'>&nbsp;&nbsp;&nbsp;&nbsp;❧&nbsp;&nbsp;&nbsp;&nbsp;" + componentText + "</span>"

    // build casting info
    var casting = document.createElement("DIV");
    casting.classList.add("casting-data")
    casting.innerHTML += "<div class='cast-time'>" + spell.casting_time + "</div>";
    casting.innerHTML += "<div class='cast-range'>" + spell.range + "</div>";
    casting.innerHTML += "<div class='cast-duration'>" + spell.duration + "</div>";

    // flags
    var flags = document.createElement("DIV");
    flags.classList.add("flags");
    
    if (spell.concentration) {
        var concentration = document.createElement("DIV");
        concentration.classList.add("concentration", "flag-icon");
        flags.append(concentration);
    }

    if (spell.ritual) {
        var ritual = document.createElement("DIV");
        ritual.classList.add("ritual", "flag-icon");
        flags.append(ritual);
    }

    // assemble header
    header.append(title);
    header.append(meta);
    header.append(casting);
    header.append(flags);

    // build/assemble description
    var desc = document.createElement("DIV");
    desc.classList.add("desc-section");

    if (spell.material != null) {
        desc.innerHTML += "<div class='materials'>Material: " + spell.material + "</div>";
    }

    var descList = document.createElement("UL");
    descList.classList.add("desc-list")
    var shouldContinue = true;
    for (let i = 0; i < spell.desc.length && shouldContinue; i++) {
        var descItem = document.createElement("LI");
        descItem.innerHTML = spell.desc[i];
        descList.append(descItem);
    }
    desc.append(descList);

    // assemble card
    card.append(header);
    card.append(desc);
    
    return card;
}

function amendDescription(cardData) {
    // TODO: abbreviate words?

    switch(cardData.name) {
        case "Control Water":
        case "Contagion":
        case "Polymorph":
        case "Scrying":
        case "Wall of Stone":
        case "Reincarnate":
        case "Antipathy/Sympathy":
        case "Earthquake":
        case "Shapechange":
        case "Storm of Vengeance":
        case "Dominate Beast":
        case "Conjure Elemental":
        case "Planar Binding":
        case "Move Earth":
        case "Plane Shift":
        case "Animal Shapes":
        case "Mirage Arcane":
        case "Speak with Plants":
            cardData.desc = [
                cardData.desc[0],
                "<br/><br/><i>See the player's handbook for more information.</i>"
            ]
    }

    if (cardData.name == "Enhance Ability") {
        cardData.desc = [
            "You touch a creature and bestow upon it a magical enhancement. Choose one of the following effects; the target gains that effect until the spell ends.",
            "<div class='spell-subsection'>Bear's Endurance.</div>",
            "<div class='spell-subdescription'>The target has advantage on constitution checks. It also gains 2d6 temporary hit points, which are lost when the spell ends.</div>",
            "<div class='spell-subsection'>Bull's Strength.</div>",
            "<div class='spell-subdescription'>The target has advantage on strength checks, and his or her carrying capacity doubles.</div>",
            "<div class='spell-subsection'>Cat's Grace.</div>",
            "<div class='spell-subdescription'>The target has advantage on dexterity checks. It also doesn't take damage from falling 20 feet or less if it isn't incapacitated.</div>",
            "<div class='spell-subsection'>Eagle's Splendor.</div>",
            "<div class='spell-subdescription'>The target has advantage on Charisma checks.</div>",
            "<div class='spell-subsection'>Fox's Cunning.</div>",
            "<div class='spell-subdescription'>The target has advantage on intelligence checks.</div>",
            "<div class='spell-subsection'>Owl's Wisdom.</div>",
            "<div class='spell-subdescription'>The target has advantage on wisdom checks.</div>",
        ]
    }

    if (cardData.name == "Create or Destroy Water") {
        cardData.desc = [
            "You either create or destroy water",
            "<div class='spell-subsection'>Create Water.</div>",
            "<div class='spell-subdescription'>You create up to 10 gallons of clean water within range in an open container. Alternatively, the water falls as rain in a 30-foot cube within range.</div>",
            "<div class='spell-subsection'>Destroy Water.</div>",
            "<div class='spell-subdescription'>You destroy up to 10 gallons of water in an open container within range. Alternatively, you destroy fog in a 30-foot cube within range.</div>",
        ]
    }

}