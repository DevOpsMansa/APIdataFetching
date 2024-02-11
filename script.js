import * as Carousel from "./Carousel.js";
import axios from "axios";
//const axios = Window.axios;

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");
// The table with additional info element
const breedInfoTable = document.getElementById("breedInfo");
//body element
const bodyElement = document.querySelector("body");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_S30DSBzPaRQQFXxA0mjdkXTwpBXwEUFvkol8yBJ3QPnD3UUItjNHtZCg608Yqi3w";

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
// Set config defaults when creating the instance
const instance = axios.create();

// Alter defaults after instance has been created
instance.defaults.headers.common["x-api-key"] = API_KEY;

/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */
/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

function updateProgress(ProgressEvent) {
  console.log(ProgressEvent);
  progressBar.style.width = String(ProgressEvent.progress * 100) + "%";
}
instance.interceptors.request.use(
  (request) => {
    console.log("request begins");
    bodyElement.style.cursor = "progress";
    request.metadata = request.metadata || {};
    request.metadata.startTime = new Date().getTime();
    progressBar.style.width = "0%";
    return request;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);
instance.interceptors.response.use(
  (response) => {
    console.log("response returns");
    bodyElement.style.removeProperty("cursor");
    response.config.metadata.endTime = new Date().getTime();
    response.durationInMS =
      response.config.metadata.endTime - response.config.metadata.startTime;
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date().getTime();
    error.durationInMS =
      error.config.metadata.endTime - error.config.metadata.startTime;
    throw error;
  }
);

/**
 * Async function that gets breeds name from TheCat API and sdd them to select element
 */
(async function initialLoad() {
  //API end point to get breeds
  const url = `https://api.thecatapi.com/v1/breeds`;
  //get result
  const { data, durationInMS } = await instance.get(url);
  console.log(durationInMS);
  //create options and add them to select
  createOptions(data);
  //add images for first selected breed
  getImages(data[0].id);
})();

/**
 * Helper function that creates options for select element and add them to DOM
 * @param {list of objects} objectList
 */
function createOptions(objectList) {
  objectList.forEach((element) => {
    //create new option element
    const optionElement = document.createElement("option");
    //add value attribute and text
    optionElement.setAttribute("value", element.id);
    optionElement.textContent = element.name;
    //append to select element new child
    breedSelect.appendChild(optionElement);
  });
}

//event listener for changing selected option in select element
breedSelect.addEventListener("change", selectBreed);

/**
 * Event handler that takes images for selected breed and shows them in carousel
 * @param {object} event
 */
function selectBreed(event) {
  //take value of selected option - it's our breed ID
  const breed_id = event.target.value;
  getImages(breed_id);
}

function getImages(breed_id) {
  //create url for getting not more than 10 random pictures of selected breed ID
  const url = `https://api.thecatapi.com/v1/images/search?limit=10&breed_ids=${breed_id}`;
  //fetch data
  instance
    .get(url, { onDownloadProgress: updateProgress })
    .then((response) => {
      /*           return response.data;
       })
       .then((data) => {*/
      //create carousel from images
      createCarousel(response.data);
      createAdditionalInformation(response.data[0].breeds[0]);
      console.log(response.durationInMS);
    })
    .catch((error) => {
      console.log(error);
    });
}

/**
 * Helper function that create the carousel object and add carousel items based on data from API
 * @param {list of objects} imagesArray
 */
function createCarousel(imagesArray) {
  //clear current carousel if we had it on page
  Carousel.clear();
  //start carousel creation
  Carousel.start();
  //loop through all images
  imagesArray.forEach((image) => {
    //create a new carousel item
    let item = Carousel.createCarouselItem(
      image.url,
      `${image.breeds[0].name} example`,
      image.id
    );
    //add item to carousel
    Carousel.appendCarousel(item);
  });
}
/**
 * Helper function that fulfill table with information about breed
 * @param {object} breedInfo
 */
function createAdditionalInformation(breedInfo) {
  //clear table in case it has information about previous breed
  clearTable();
  //add information using key from breed object
  for (let parameter_key in breedInfo) {
    try {
      let td = {};
      switch (parameter_key) {
        case "weight":
          //add information information in different units of measure
          td = breedInfoTable.querySelector(`#breed-${parameter_key}`);
          td.textContent = `${breedInfo[parameter_key].imperial} lb or ${breedInfo[parameter_key].metric} kg`;
          break;
        case "alt_names":
          //add alternative names to NAME cell if they exist
          td = breedInfoTable.querySelector(`#breed-name`);
          if (breedInfo[parameter_key])
            td.textContent += ` (${breedInfo[parameter_key]}) `;
          break;
        case "wikipedia_url":
          //add link instead of text
          let anchor = breedInfoTable.querySelector(`#breed-${parameter_key}`);
          anchor.setAttribute("href", breedInfo[parameter_key]);
          break;
        default:
          //for all cells that contains id with information add data
          td = breedInfoTable.querySelector(`#breed-${parameter_key}`);
          //change 0 data to No and 1 - to Yes, leave other type as it is
          td.textContent =
            breedInfo[parameter_key] === 0
              ? "no"
              : breedInfo[parameter_key] === 1
              ? "yes"
              : breedInfo[parameter_key];
          break;
      }
    } catch (error) {
      //we could find some parameters that we don't use in table, just skip them
      continue;
    }
  }
}

/**
 * Helper function that cleans all data in table
 */
function clearTable() {
  const name = breedInfoTable.querySelector("#breed-name");
  name.textContent = "";
  const cells = breedInfoTable.querySelectorAll("td");
  for (let index = 0; index < cells.length; index++) {
    if (cells[index].getAttribute("id")) {
      cells[index].textContent = "";
    }
  }
}

/*==================================== */

const fetchChange = document.getElementById("change");
fetchChange.textContent = "Change fetch method to Fetch!";
fetchChange.onclick = changeScriptFile;
function changeScriptFile() {
  const mainJSfile = document.getElementById("mainJSfile");
  mainJSfile.setAttribute("src", "script.js");
}

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId) {
  // your code here
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
