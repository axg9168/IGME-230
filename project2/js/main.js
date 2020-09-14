//Public API docs from here: https://pokeapi.co/docs/v2.html

function init_Buttons(e) //do this onload
{
    document.querySelector("#typeBtn").onclick = searchByType;
    document.querySelector("#abilityBtn").onclick = searchByAbility;
    document.querySelector("#pokemonBtn").onclick = searchByPokemon;
    document.querySelector("#numBtn").onclick = searchByNumber;

    const numField = document.querySelector("#searchByNumber");
    const numKey = "pokedex-number";
    const storedNum = localStorage.getItem(numKey);

    if(storedNum) //if there is a stored value
    {
        let dexBtn = document.querySelector("#numBtn");
        numField.value = storedNum; //set the search field to the stored number
        
        //simulate clicking the Go! button
        //code taken from: https://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript/2706236#2706236
        if (dexBtn.fireEvent)
        {
            dexBtn.fireEvent('on' + "click");
        } 
        else
        {
            let evObj = document.createEvent('Events');
            evObj.initEvent("click", true, false);
            dexBtn.dispatchEvent(evObj);
        }
    }
    numField.onchange = e=>{ localStorage.setItem(numKey, e.target.value); };
}
window.onload = init_Buttons;

const POKE_URL = "https://pokeapi.co/api/v2/";
const TOTAL_POKEMON = 807; //total number of pokemon up to gen 7 (not including different forms)
const TOTAL_ABILITIES = 233; //total number of abilities (only in main series games)
const TOTAL_TYPES = 20; //total number of types

function searchByType() //call when the Search by Type button is clicked
{
    let type_url = POKE_URL + "type/"; //build type URL
    getData(type_url); //get data based on pokemon type
}

function searchByAbility() //call when the Search by Ability button is clicked
{
    let ability_url = POKE_URL + "ability?offset=0&limit=" + TOTAL_ABILITIES; //build ability URL
    getData(ability_url); //get data based on pokemon ability
}

function searchByPokemon() //call when the Search by Pokemon button is clicked
{
    let pokemon_url = POKE_URL + "pokemon?offset=0&limit=" + TOTAL_POKEMON; //build pokemon URL
    getData(pokemon_url); //get data based on specific pokemon
}

function searchByNumber() //call when the Go! button is clicked
{
    let num = document.querySelector("#searchByNumber").value;
    let errorMsg = document.createElement("p");
    let errorDiv = document.querySelector("#error");
    
    if(num >= 1 && num <= 807) //if num is a valid pokemon number
    {
        let pokemon_url = POKE_URL + "pokemon/" + num; //set the URL
        if(errorDiv.firstChild) //remove any children from the error div, if they exist
        {
            errorDiv.removeChild(errorDiv.firstChild);
        }
        getPokemonData(pokemon_url); //display pokemon info
    }
    else
    {
        errorMsg.innerHTML = "That value is not an existing Pokemon. Please enter a number from 1-807 and try again.";
        if(errorDiv.firstChild) //remove any children from the error div, if they exist
        {
            errorDiv.removeChild(errorDiv.firstChild);
        }
        errorDiv.appendChild(errorMsg); //append the error message to the error div
    }
}

function getData(url)
{
    let xhr = new XMLHttpRequest(); //create a new XHR object
    xhr.onload = dataLoaded;        //*set the onload handler
    xhr.onerror = dataError;        //set the onerror handler
    xhr.open("GET", url);           //open connection
    xhr.send();                     //send request
}
function getPokemonData(url)
{
    let xhr = new XMLHttpRequest();  //create a new XHR object
    xhr.onload = displayPokemonInfo; //*set the onload handler
    xhr.onerror = dataError;         //set the onerror handler
    xhr.open("GET", url);            //open connection
    xhr.send();                      //send request
}
function getTypeAbilityData(url)
{
    let xhr = new XMLHttpRequest();        //create a new XHR object
    xhr.onload = displayTypeAbilityInfo;   //*set the onload handler
    xhr.onerror = dataError;               //set the onerror handler
    xhr.open("GET", url);                  //open connection
    xhr.send();                            //send request
}

function dataLoaded(e) //load all dropdown menus and buttons, depending on the user's choice
{
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText); //turn the text into a parsible JavaScript object
    
    if(!obj.results || obj.length == 0) //if there are no results, quit
    {
        return;
    }
    
    //build HTML strings and elements to display
    let results = obj.results;
    
    let dropDown = document.createElement("select");
    let searchBtn = document.createElement("button");
    dropDown.setAttribute("id", "values");
    searchBtn.setAttribute("type", "button");
    searchBtn.setAttribute("id", "searchBtn");
    searchBtn.setAttribute("class", "pokeball");
    searchBtn.innerHTML = "Search!";
    
    for(let i = 0; i < results.length; i++) //loop through the array of results
    {
        let result = results[i];
        let url = result.url;          //get the URL to the PokeAPI page
        let value = result.name;       //get each Pokemon type from the PokeAPI
        let values = [results.length]; //create an array with length of the results
        values[i] = value;             //store each type in an array
        
        let op = document.createElement("option"); //create a dropdown option for each type
        op.setAttribute("value", values[i]);       //set the option value to each type
        op.innerHTML = values[i];                  //set the option text to each type
        dropDown.appendChild(op);                  //append each option to the dropdown
    }
    
    let widgets = document.querySelector(".widgets");
    if(!widgets.hasChildNodes()) //if the widgets class does not contain any child nodes
    {
        widgets.appendChild(dropDown);
        widgets.appendChild(searchBtn);
    }
    else //if widgets class contains a child
    {
        while(widgets.firstChild) //while widgets has a child
        {
            widgets.removeChild(widgets.firstChild); //delete all children
        }
        widgets.appendChild(dropDown);  //add the dropdown
        widgets.appendChild(searchBtn); //add the search button
        searchBtn.onclick = function searchValue()
        {
            if(dropDown.length == TOTAL_ABILITIES) //if abilities are being searched for
            {
                let ability_url = POKE_URL + "ability/" + dropDown.value;
                getTypeAbilityData(ability_url);
            }
            else if(dropDown.length == TOTAL_POKEMON) //if pokemon is being searched for
            {
                let pokemon_url = POKE_URL + "pokemon/" + dropDown.value;
                getPokemonData(pokemon_url);
            }
            else if(dropDown.length == TOTAL_TYPES) //if types are being searched for
            {
                let type_url = POKE_URL + "type/" + dropDown.value;
                getTypeAbilityData(type_url);
            }
        };
    }
}

function displayTypeAbilityInfo(e) //displays all pokemon that have the selected type or ability
{
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText); //turn the text into a parsible JavaScript object
    
    if(!obj.pokemon || obj.length == 0) //if there are no results, quit
    {
        return;
    }
    
    //build HTML strings to display
    let pokemon = obj.pokemon;
    let numResults = document.querySelector("#values");
    let bigString = "";
    if(numResults.length == TOTAL_TYPES) //if types are being searched for
    {
        bigString += "<p><em>Pokemon with type <strong>" + obj.name + ":</strong></em></p>";
    }
    else if(numResults.length == TOTAL_ABILITIES) //if abilities are being searched for
    {
        let description = obj.effect_entries[0].short_effect;
        bigString += "<p><em><strong>" + obj.name + "</strong>: " + description + "</em></p>";
    }
    
    for(key in pokemon) //loop through every key in the Pokemon object
    {
        if(pokemon.hasOwnProperty(key)) //if the key has an associated value
        {
            let value = pokemon[key];
            let name = value.pokemon.name;
            let url = value.pokemon.url;
            let idSlash = url.split("https://pokeapi.co/api/v2/pokemon/")[1]; //split the url to get the Pokedex number
            let dexNum = idSlash.split("/")[0]; //split the Pokedex number to only contain the number (no slashes)
            let line = "<div class='result'>";
            line += "<span><p>" + name + "</p></span>"; //add the type to the line
            if(dexNum <= 807 && dexNum >= 100) //if the Pokedex number is between 100-807 then use the default image URL
            {
                line += "<img src='https://www.serebii.net/pokemon/art/" + dexNum + ".png' width=100px height=100px></div>"
            }
            else if(dexNum < 100 && dexNum >= 10) //if the Pokedex number is between 10-99 then add 1 extra 0 to the beginning of dexNum
            {
                line += "<img src='https://www.serebii.net/pokemon/art/0" + dexNum + ".png' width=100px height=100px></div>"
            }
            else if(dexNum < 10) //if the Pokedex number is less than 10 then add 2 extra 0's to the beginning of dexNum
            {
                line += "<img src='https://www.serebii.net/pokemon/art/00" + dexNum + ".png' width=100px height=100px></div>"
            }
            else //if dexNum is greater than 807, don't add an image
            {
                line += "</div>"
            }
            bigString += line;
        }
    }
    
    document.querySelector("#content").innerHTML = bigString; //display string to user
}

function displayPokemonInfo(e) //displays stats for the selected pokemon
{
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText); //turn the text into a parsible JavaScript object
    
    if(!obj.abilities || obj.length == 0) //if there are no results, quit
    {
        return;
    }
    
    //build HTML strings to display
    let abilities = obj.abilities;
    let types = obj.types;
    let stats = obj.stats;
    let pokemonName = obj.name;
    let bigString = "<p><em>Here is information regarding <strong>" + pokemonName + "</strong>:</em></p>";
    
    let pokemonImage = "https://www.serebii.net/pokemon/art/";
    let dexNum = obj.id;
    if(dexNum <= 807 && dexNum >= 100) //if the Pokedex number is between 100-807 then use the default image URL
    {
        pokemonImage += dexNum + ".png";
        let line = "<div class='result'><img src='" + pokemonImage + "' width=100px height=100px></div>";
        bigString += line;
    }
    else if(dexNum < 100 && dexNum >= 10) //if the Pokedex number is between 10-99 then add 1 extra 0 to the beginning of dexNum
    {
        pokemonImage += "0" + dexNum + ".png";
        let line = "<div class='result'><img src='" + pokemonImage + "' width=100px height=100px></div>";
        bigString += line;
    }
    else if(dexNum < 10) //if the Pokedex number is less than 10 then add 2 extra 0's to the beginning of dexNum
    {
        pokemonImage += "00" + dexNum + ".png";
        let line = "<div class='result'><img src='" + pokemonImage + "' width=100px height=100px></div>";
        bigString += line;
    }
    
    for(key in types) //loop through each key in the types object
    {
        if(types.hasOwnProperty(key))
        {
            let value = types[key];
            let name = value.type.name;
            let typeUrl = "https://www.serebii.net/pokedex-bw/type/" + name + ".gif";
            let line = "<div class='result'><span><p>Type: <img src='" + typeUrl + "'></p></span></div>"; //add the type to the line
            bigString += line;
        }
    }
    
    for(key in abilities) //loop through each key in the abilities object
    {
        if(abilities.hasOwnProperty(key))
        {
            let value = abilities[key];
            let name = value.ability.name;
            let line = "<div class='result'><span><p>Ability: <em>" + name + "</em></p></span></div>"; //add the ability to the line
            bigString += line;
        }
    }
    
    for(key in stats) //loop through each key in the stats object
    {
        if(stats.hasOwnProperty(key))
        {
            let value = stats[key];
            let name = value.stat.name;
            let base = value.base_stat;
            let line = "<div class='result'><span><p>" + name + ": " + base + "</p></div>"; //add the stat to the line
            bigString += line;
        }
    }
    
    document.querySelector("#content").innerHTML = bigString; //display string to user
}

function dataError(e) //only called if the XHR request fails
{
    console.log("An error occurred. Please try again.");
}