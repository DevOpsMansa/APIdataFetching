//import carousel functions
import * as Carousel from "./Carousel.js";

// Store my API key here for reference and easy access.
const API_KEY = "PUT YOUR OWN KEY HERE";

//UserId for post requests
const SUB_ID = "mansa-marah";

/**
 * Helper function that creates options for select element and add them to DOM
 * @param {list of objects} objectList list of items that would be options
 * @param {DOM object} parentObject referance to select element
 */
function createOptions(objectList, parentObject) {

    objectList.forEach(element => {
        //create new option element
        const optionElement = document.createElement("option");
        //add value attribute and text
        optionElement.setAttribute("value", element.id);
        optionElement.textContent = element.name
        //append to select element new child
        parentObject.appendChild(optionElement);
    });
}

