(() => {
  "use strict";

  //---------------------------GLOBAL VARIABLES------------------------------------
  // Please replace API_KEY with your own api key (more info in readme)
  const API_KEY = "DEMO_KEY";
  const API_URL = "https://api.nasa.gov/mars-photos/api/v1/rovers";

  //---------------------------DOM MANIPULATION MODULE------------------------------------
  /**
   * Dom module for managing screen visibility, modals, toasts, and input errors.
   * @module Dom
   */
  const Dom = (() => {
    const screens = {
      searchScreen: document.getElementById("searchScreen"),
      savedListScreen: document.getElementById("savedListScreen"),
      storyScreen: document.getElementById("storyScreen"),
    };
    //spinner
    const spinnerElement = document.getElementById("spinnerDiv");
    //toast
    const toastContainer = document.getElementById("toastContainer");
    const toastEl = document.getElementById("notificationToast");
    const toastMessage = document.getElementById("toastMessage");
    //modal
    const modalTitle = document.getElementById("genericModalLabel");
    const modalBody = document.querySelector("#genericModal .modal-body");
    const modalDiv = document.getElementById("genericModal");

    /**
     * hides all the screens
     */
    const hideAllScreens = () => {
      Object.values(screens).forEach((item) => item.classList.add("d-none"));
    };

    return {
      /**
       * Hides the specified DOM element by adding the "d-none" class.
       * @param {HTMLElement} item - The DOM element to hide.
       */
      hideItem: (item) => {
        item.classList.add("d-none");
      },
      /**
       * Shows the specified DOM element by removing the "d-none" class.
       * @param {HTMLElement} item - The DOM element to show.
       */
      showItem: (item) => {
        item.classList.remove("d-none");
      },
      /**
       * Displays the screen corresponding to the provided screen name.
       * @param {string} screenName - The name of the screen to display (e.g., "searchScreen").
       */
      showScreen: (screenName) => {
        hideAllScreens();
        screens[screenName].classList.remove("d-none");
        rendererModule.renderSavedPhotos();
      },
      /**
       * Shows the spinner element by removing the "d-none" class.
       */
      showSpinner: () => {
        spinnerElement.classList.remove("d-none");
      },
      /**
       * Hides the spinner element by adding the "d-none" class.
       */
      hideSpinner: () => {
        spinnerElement.classList.add("d-none");
      },
      /**
       * Clears any existing error messages for the input element.
       * @param {Event} event - The event object triggered by the input element.
       */
      clearInputErrors: (event) => {
        let previousError = event.target.querySelector(".invalid-feedback");
        if (previousError) {
          previousError.remove();
        }
        event.target.date.classList.remove("is-invalid");
      },
      /**
       * Inserts an error message into the DOM for the input element.
       * @param {Event} event - The event object triggered by the input element.
       * @param {string} errorMsg - The error message to display.
       */
      insertError: (event, errorMsg) => {
        let error = document.createElement("div");
        error.innerHTML = errorMsg;
        error.classList.add("invalid-feedback");
        event.target.date.parentElement.appendChild(error);
        event.target.date.classList.add("is-invalid");
      },
      /**
       * Appends a new HTML element to a specified parent element.
       * @param {HTMLElement} element - The HTML element to append.
       * @param {HTMLElement} where - The parent element to append to.
       */
      insertHTMLElement: (element, where) => {
        where.appendChild(element);
      },
      /**
       * Clears filter options in a given select element and inserts an "All" option.
       * @param {HTMLElement} where - The select element to clear and update.
       */
      clearFilterOptions: (where) => {
        const all = document.createElement("option");
        all.innerHTML = "All";
        where.innerHTML = "";
        Dom.insertHTMLElement(all, where);
      },
      /**
       * Displays a toast notification with a specified color and message.
       * @param {string} color - The color of the toast (e.g., "bg-success", "bg-danger").
       * @param {string} message - The message to display in the toast.
       */
      displayNotification: (color, message) => {
        toastMessage.classList.remove("bg-success", "bg-danger");
        toastMessage.innerHTML = message;
        toastMessage.classList.add(color);

        toastContainer.style.display = "block";

        const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
        toast._config.delay = 1500;
        toast.show();
      },
      /**
       * Displays a modal with a specified title and message.
       * @param {string} title - The title to display in the modal.
       * @param {string} message - The message to display in the modal.
       */
      displayModalMessage: (title, message) => {
        modalTitle.textContent = title;
        modalBody.innerHTML = message;
        const modal = new bootstrap.Modal(modalDiv);
        modal.show();
      },
    };
  })();

  //---------------------------API MODULE------------------------------------
  /**
   * API module for fetching data from the NASA API.
   * @module APIMODULE
   */
  const APIMODULE = (() => {
    /**
     * Checks the status of the response and returns a promise with the response or an error.
     * @param {Response} response - The response object from the fetch request.
     * @returns {Promise} - A promise with the response object or an error.
     */
    const status = async (response) => {
      if (response.ok) {
        return Promise.resolve(response);
      } else {
        const errorText = await response.text();
        return Promise.reject(
          new Error(`Error ${response.status}: ${errorText}`)
        );
      }
    };

    /**
     * Retries a fetch request a specified number of times with a delay between each attempt.
     * @param {string} url - The URL to fetch data from.
     * @param {number} retries - The number of times to retry the fetch request.
     * @param {number} delay - The delay in milliseconds between each retry.
     * @returns {Promise} - A promise with the response object or an error.
     */
    const retryFetch = async (url, retries = 3, delay = 1000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await fetch(url);

          if (response.status === 503 && attempt < retries) {
            await new Promise((resolve) =>
              setTimeout(resolve, delay * attempt)
            );
            continue;
          }

          await status(response);
          return response;
        } catch (err) {
          throw err;
        }
      }
    };

    return {
      /**
       * Fetches data from the specified URL and returns the response as JSON.
       *  @param {string} url - The URL to fetch data from.
       * @returns {Promise} - A promise with the response object as JSON.
       */
      getDataFromAPI: async (url) => {
        Dom.showSpinner();
        try {
          const response = await retryFetch(url);
          const asJson = await response.json();
          return asJson;
        } catch (err) {
          Dom.displayModalMessage(
            "Error",
            `Oops, seems like there has been a problem! Error: ${err.message}`
          );
          console.error("API request failed: ", err.message);
        } finally {
          Dom.hideSpinner();
        }
      },
    };
  })();

  //---------------------------HELPER FUNCTIONS------------------------------------
  /**
   * Converts a date object to a string in the format "YYYY-MM-DD".
   * @param {Date} date - The date object to convert to a string.
   * @returns {string} - The date as a string in the format "YYYY-MM-DD".
   */
  const dateToString = (date) => {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  //---------------------------VALIDATION MODULE------------------------------------
  /**
   * Validation module for checking if a date is within a specified range.
   * @module validationModule
   */
  const validationModule = (() => {
    const validDates = {
      latest: new Date(),
      earliest: new Date(),
    };

    return {
      getEarliest: () => validDates.earliest,
      getLatest: () => validDates.latest,
      setEarliest: (date) => (validDates.earliest = date),
      isDateOutOfRange: (date) =>
        date < validDates.earliest || date > validDates.latest,
    };
  })();

  //---------------------------UI MODULE------------------------------------
  /**
   * UI module for handling user interactions and updating the DOM.
   * @module UI
   */
  const UI = (() => {
    /**
     * Searches for photos taken on the specified date by the selected rover.
     * @param {Event} event - The event object triggered by the form submission.
     * @returns {Promise} - A promise with the fetched photos or an error.
     */
    const searchDate = async (event) => {
      event.preventDefault();
      let chosenDate = new Date(event.target.date.value);

      //remove previous errors
      Dom.clearInputErrors(event);

      //make sure date is in range
      if (
        validationModule.isDateOutOfRange(chosenDate) ||
        event.target.date.value === ""
      ) {
        Dom.insertError(
          event,
          `Date entered is invalid, please enter dates between ${dateToString(
            validationModule.getEarliest()
          )} and ${dateToString(validationModule.getLatest())}`
        );
      }
      //date is in range, keep try fetching until you are getting images
      else {
        roverDataModule.resetAllFetchedImages();
        let delta = 1;
        let attempt = 0;
        let date = new Date(chosenDate);
        let firstTryFailed = false;

        try {
          await roverDataModule.getPhotosAtDate(chosenDate);

          while (
            Object.keys(roverDataModule.getAllFetchedImages()).length == 0
          ) {
            firstTryFailed = true;
            date = new Date(
              chosenDate -
                24 * 60 * 60 * 1000 * (attempt++ % 2 == 0 ? -delta : delta++)
            );
            await roverDataModule.getPhotosAtDate(date);
          }
          if (firstTryFailed) {
            Dom.displayModalMessage(
              "No photos found",
              `Could not find photos at the selected date, showing photos for ${dateToString(
                date
              )}`
            );
          }
          event.target.date.value = dateToString(date);
        } catch (error) {
          console.error("An error occurred:", error);
        }
        populateRoverFilters();
        populateCameraFilters(document.getElementById("roverFilter").value);
        roverDataModule.setCameraFilter("All");
        roverDataModule.setRoverFilter("All");
        rendererModule.renderAllCurrentPhotos();
      }
    };

    /**
     * Resets the search form and hides the filters and search results.
     * @param {Event} event - The event object triggered by the form submission.
     */
    const resetForm = (event) => {
      const filtersContainer = document.getElementById("filtersContainer");
      const resultsDiv = document.getElementById("searchResultsDiv");
      Dom.hideItem(filtersContainer);
      Dom.hideItem(resultsDiv);
    };

    /**
     * Populates the rover filter with the names of the available rovers.
     */
    const populateRoverFilters = () => {
      const container = document.getElementById("filtersContainer");
      const roverFilter = document.getElementById("roverFilter");

      Dom.clearFilterOptions(roverFilter);

      //insert the current rovers into the filter
      Object.keys(roverDataModule.getAllFetchedImages()).forEach((rover) => {
        let option = document.createElement("option");
        option.innerHTML = `${rover}`;
        Dom.insertHTMLElement(option, roverFilter);
      });
      Dom.showItem(container);
    };

    /**
     * Populates the camera filter with the names of the available cameras for the selected rover.
     * @param {string} roverName - The name of the selected rover.
     */
    const populateCameraFilters = (roverName) => {
      const cameraFilter = document.getElementById("cameraFilter");

      Dom.clearFilterOptions(cameraFilter);

      //check what do we need to populate
      let cameras;
      if (roverName === "All") {
        cameras = roverDataModule.getAllCurrentCameras();
      } else {
        cameras = roverDataModule.getSpecificRoverCameras(roverName);
      }
      //insert to the camerafilter
      cameras.forEach((camera) => {
        let option = document.createElement("option");
        option.innerHTML = camera;
        Dom.insertHTMLElement(option, cameraFilter);
      });
    };

    /**
     * Event handler for when the rover filter is changed.
     * @param {Event} event - The event object triggered by the filter change.
     */
    const roverFilterChange = (event) => {
      populateCameraFilters(event.target.value);
      roverDataModule.setRoverFilter(event.target.value);
      rendererModule.renderAllCurrentPhotos();
    };

    /**
     * Event handler for when the camera filter is changed.
     * @param {Event} event - The event object triggered by the filter change.
     */
    const cameraFilterChange = (event) => {
      roverDataModule.setCameraFilter(event.target.value);
      rendererModule.renderAllCurrentPhotos();
    };

    return {
      /**
       * Initializes the UI by fetching the rover data and adding event listeners.
       * @param {Event} event - The event object triggered by the DOMContentLoaded event.
       */
      init: async (event) => {
        //fetch the valid earliest date for rovers
        //need to add handling for when cannot get data from the api
        try {
          const roverData = await APIMODULE.getDataFromAPI(
            `${API_URL}?api_key=${API_KEY}`
          );
          roverDataModule.setRovers(roverData.rovers);
          roverData.rovers.forEach((obj) => {
            let current = new Date(obj.landing_date);
            if (current < validationModule.getEarliest()) {
              validationModule.setEarliest(current);
            }
          });
        } catch (error) {
          console.error(error);
        }

        //add ui handlers
        document
          .getElementById("searchNavButton")
          .addEventListener("click", () => {
            Dom.showScreen("searchScreen");
          });
        document
          .getElementById("savedListNavButton")
          .addEventListener("click", () => {
            Dom.showScreen("savedListScreen");
          });
        document
          .getElementById("whoAmINavButton")
          .addEventListener("click", () => {
            Dom.displayModalMessage(
              "Who Am I?",
              "Name: Yehu Raccah<br>E-Mail: yehura@edu.hac.ac.il"
            );
          });
        document
          .getElementById("searchForm")
          .addEventListener("submit", searchDate);
        document
          .getElementById("roverFilter")
          .addEventListener("change", roverFilterChange);
        document
          .getElementById("cameraFilter")
          .addEventListener("change", cameraFilterChange);
        document
          .getElementById("generateStoryButton")
          .addEventListener("click", () => {
            listManager.generateCarousel();
            Dom.showScreen("storyScreen");
          });
        document
          .getElementById("returnToList")
          .addEventListener("click", () => {
            Dom.showScreen("savedListScreen");
          });
        document
          .getElementById("clearForm")
          .addEventListener("click", resetForm);
      },
    };
  })();

  //---------------------------ROVER DATA MODULE------------------------------------
  /**
   * Rover data module for managing rover data and filtering images.
   * @module roverDataModule
   */
  const roverDataModule = (() => {
    let rovers = [];
    let allFetchedImages = {};
    let roverFilter = "All";
    let cameraFilter = "All";

    /**
     * Filters the fetched images based on the selected rover and camera filters.
     * @returns {Object} - An object containing the filtered images.
     */
    const filterImages = () => {
      let filteredImages = {};
      if (roverFilter === "All" && cameraFilter === "All") {
        filteredImages = allFetchedImages;
      } else if (cameraFilter === "All") {
        filteredImages[roverFilter] = allFetchedImages[roverFilter];
      } else if (roverFilter === "All") {
        Object.keys(allFetchedImages).forEach((key) => {
          const allphotos = allFetchedImages[key];
          const newphotos = {};
          newphotos.photos = allphotos.photos.filter((photo) => {
            return photo.camera.name === cameraFilter;
          });
          if (newphotos.photos.length > 0) {
            filteredImages[key] = newphotos;
          }
        });
      } else {
        Object.keys(allFetchedImages).forEach((key) => {
          if (key === roverFilter) {
            const allphotos = allFetchedImages[key];
            const newphotos = {};

            newphotos.photos = allphotos.photos.filter((photo) => {
              return photo.camera.name === cameraFilter;
            });
            if (newphotos.photos.length > 0) {
              filteredImages[key] = newphotos;
            }
          }
        });
      }
      return filteredImages;
    };

    return {
      /**
       * Sets the rovers data to the provided data.
       * @param {Array} roversData - The array of rover data to set.
       */
      setRovers: (roversData) => (rovers = roversData),
      /**
       * Returns the array of rover data.
       * @returns {Array} - The array of rover data.
       */
      getRovers: () => rovers,
      /**
       * Resets the fetched images object.
       */
      resetAllFetchedImages: () => (allFetchedImages = {}),
      /**
       * Returns the fetched images object.
       * @returns {Object} - The fetched images object.
       */
      getAllFetchedImages: () => allFetchedImages,

      /**
       * Fetches photos from the NASA API for the specified date and stores them in the fetched images object.
       * @param {Date} date - The date to fetch photos for.
       */
      getPhotosAtDate: async (date) => {
        try {
          const promises = rovers.map(async (rover) => {
            try {
              let roverPhotos = await APIMODULE.getDataFromAPI(
                `${API_URL}/${rover.name}/photos?earth_date=${dateToString(
                  date
                )}&api_key=${API_KEY}`
              );
              if (roverPhotos.photos.length > 0) {
                allFetchedImages[rover.name] = roverPhotos;
              }
            } catch (error) {
              console.error(
                `Error while fetching data for rover:${rover.name}`,
                error
              );
            }
          });

          await Promise.all(promises);
        } catch (error) {
          console.error(`Could not fetch rover photos! ${error}`);
        }
      },
      /**
       * Returns an array of all the current cameras available for the fetched images.
       * @returns {Array} - An array of all the current cameras available for the fetched images.
       */
      getAllCurrentCameras: () => {
        const insertedCameras = new Set();

        Object.keys(allFetchedImages).forEach((rover) => {
          const rov = rovers.find((r) => r.name === rover);
          if (rov) {
            rov.cameras.forEach((camera) => {
              if (!insertedCameras.has(camera.name)) {
                insertedCameras.add(camera.name);
              }
            });
          }
        });

        return Array.from(insertedCameras);
      },
      /**
       * Returns an array of all the cameras available for the specified rover.
       * @param {string} roverName - The name of the rover to get cameras for.
       * @returns {Array} - An array of all the cameras available for the specified rover.
       */
      getSpecificRoverCameras: (roverName) => {
        const rover = rovers.find((r) => r.name === roverName);
        if (rover) {
          return rover.cameras.map((camera) => camera.name);
        } else {
          console.error(`${roverName} not found!`);
        }
      },
      /**
       * Returns the filtered images object.
       *  @returns {Object} - The filtered images object.
       */
      getFilteredImages: () => {
        return filterImages();
      },
      setCameraFilter: (camera) => {
        cameraFilter = camera;
      },
      setRoverFilter: (rover) => {
        roverFilter = rover;
      },
      /**
       * Creates an image card for the specified image object.
       * @param {Object} image - The image object to create a card for.
       * @returns {HTMLElement} - The image card element.
       */
      createImageCard: (image) => {
        //create an image card
        const imageCard = document.createElement("div");
        imageCard.className = "card col-11 col-md-3 m-2";

        //create the image element
        const imageElement = document.createElement("img");
        imageElement.src = image.img_src;
        imageElement.alt = image.id;
        imageElement.classList.add("m-2");

        //create the card body
        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        cardBody.innerHTML = `<p>Earth Date: ${image.earth_date} <br> Sol: ${image.sol} <br>Camera:${image.camera.name} <br>Mission: ${image.rover.name} </p>
        `;

        // create the image object to save
        const imageObj = {
          id: image.id,
          imgSrc: image.img_src,
          earthDate: image.earth_date,
          sol: image.sol,
          camera: image.camera.name,
          rover: image.rover.name,
        };

        // create save button and assign button handler
        const saveButton = document.createElement("button");
        saveButton.innerHTML = "Save";
        saveButton.type = "button";
        saveButton.className = "btn btn-dark";
        saveButton.addEventListener("click", () => {
          listManager.addItemToList(new SavedPicture(imageObj));
        });

        //create the fullsize display button
        const fullsize = document.createElement("a");
        fullsize.className = "btn btn-outline-dark";
        fullsize.href = image.img_src;
        fullsize.target = "_blank";
        fullsize.innerHTML = "FULLSIZE";

        //create the card footer
        const cardFooter = document.createElement("div");
        cardFooter.className =
          "card-footer d-flex justify-content-center align-items-center";
        cardFooter.appendChild(saveButton);
        cardFooter.appendChild(fullsize);

        //append all element into the final image card
        imageCard.appendChild(imageElement);
        imageCard.appendChild(cardBody);
        imageCard.appendChild(cardFooter);

        return imageCard;
      },
    };
  })();

  //---------------------------RENDERER MODULE------------------------------------
  /**
   * Renderer module for rendering images and saved photos to the DOM.
   * @module rendererModule
   */
  const rendererModule = (() => {
    return {
      /**
       * Renders all the current photos to the search results div.
       */
      renderAllCurrentPhotos: () => {
        const resultsDiv = document.getElementById("searchResultsDiv");
        resultsDiv.classList.remove("d-none");
        const photosToRender = roverDataModule.getFilteredImages();

        // could be slicker but oh well
        resultsDiv.innerHTML = "<h2>Search Results:</h2>";

        Object.values(photosToRender).forEach((images) => {
          images.photos.forEach((item) => {
            Dom.insertHTMLElement(
              roverDataModule.createImageCard(item),
              resultsDiv
            );
          });
        });
      },
      /**
       * Renders the saved photos to the saved list container.
       * Also hides the generate story button if the list is empty.
       */
      renderSavedPhotos: () => {
        const savedListDiv = document.getElementById("savedListContainer");
        const generateButton = document.getElementById("generateStoryButton");
        if (listManager.isListEmpty()) {
          savedListDiv.innerHTML =
            "No photos saved, save photos to create story.";
          Dom.hideItem(generateButton);
        } else {
          savedListDiv.innerHTML = "";
          Dom.showItem(generateButton);
          Dom.insertHTMLElement(listManager.getAsHtmlObj(), savedListDiv);
        }
      },
    };
  })();

  //---------------------------SAVED PICTURE CLASS------------------------------------
  /**
   * Class representing a saved picture object.
   * @class SavedPicture
   */
  class SavedPicture {
    /**
     * @private
     * @property {string} #id - The unique identifier for the saved picture.
     * @property {string} #imgSrc - The URL source of the image.
     * @property {string} #rover - The name of the rover that took the picture.
     * @property {string} #earthDate - The Earth date the picture was taken.
     * @property {number} #sol - The sol (Martian day) when the picture was taken.
     * @property {string} #camera - The camera that captured the image.
     * @property {string} #description - An optional description of the image.
     */
    #id;
    #imgSrc;
    #rover;
    #earthDate;
    #sol;
    #camera;
    #description = "";

    /**
     * Creates an instance of a saved picture object.
     * @param {Object} savedPictureObj - The object containing the saved picture data.
     * @param {string} savedPictureObj.id - The unique identifier for the saved picture.
     * @param {string} savedPictureObj.imgSrc - The URL source of the image.
     * @param {string} savedPictureObj.rover - The name of the rover that took the picture.
     * @param {string} savedPictureObj.earthDate - The Earth date the picture was taken.
     * @param {number} savedPictureObj.sol - The sol (Martian day) when the picture was taken.
     * @param {string} savedPictureObj.camera - The camera that captured the image.
     * @param {string} savedPictureObj.description - An optional description of the image.
     * @constructor
     */
    constructor(savedPictureObj) {
      this.#id = savedPictureObj.id;
      this.#imgSrc = savedPictureObj.imgSrc;
      this.#rover = savedPictureObj.rover;
      this.#earthDate = savedPictureObj.earthDate;
      this.#sol = savedPictureObj.sol;
      this.#camera = savedPictureObj.camera;
    }

    //getters
    get id() {
      return this.#id;
    }
    get imgSrc() {
      return this.#imgSrc;
    }
    get rover() {
      return this.#rover;
    }
    get earthDate() {
      return this.#earthDate;
    }
    get sol() {
      return this.#sol;
    }
    get camera() {
      return this.#camera;
    }
    get description() {
      return this.#description;
    }

    /**
     * Returns the saved picture object as an HTML element.
     * @returns {HTMLElement} - The saved picture object as an HTML element.
     */
    getAsHtmlObj() {
      const pictureCard = document.createElement("div");
      pictureCard.className = "card col-11";

      const image = document.createElement("img");
      image.src = this.#imgSrc;
      image.alt = this.#id;
      image.classList.add("m-2", "col-2");

      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");

      const cardText = document.createElement("p");
      cardText.classList.add("card-text");
      cardText.innerHTML = `Rover: ${this.#rover}, Earth Date: ${
        this.#earthDate
      }, Sol: ${this.#sol}, Camera: ${this.#camera}`;

      const removeButton = document.createElement("button");
      removeButton.innerHTML = "remove";
      removeButton.type = "button";
      removeButton.className = "btn btn-danger";
      removeButton.addEventListener("click", () =>
        listManager.removeItem(this)
      );

      const textArea = document.createElement("textarea");
      textArea.placeholder = "Enter description(optional)";
      textArea.classList.add("col-12", "form-control");
      textArea.value = this.#description;

      textArea.addEventListener("input", (event) => {
        this.#description = event.target.value;
      });

      const cardFooter = document.createElement("div");
      cardFooter.className =
        "card-footer d-flex justify-content-center align-items-center";

      cardFooter.appendChild(removeButton);
      cardBody.appendChild(cardText);
      cardBody.appendChild(textArea);

      pictureCard.appendChild(image);
      pictureCard.appendChild(cardBody);
      pictureCard.appendChild(cardFooter);

      return pictureCard;
    }
  }

  //---------------------------LIST MANAGER MODULE------------------------------------
  /**
   * List manager module for managing the saved picture list.
   * @module listManager
   */
  const listManager = (() => {
    const savedItemsList = [];

    return {
      /**
       * Adds a saved picture object to the saved picture list.
       * @param {SavedPicture} item - The saved picture object to add to the list.
       * @throws {Error} - If the item is not an instance of SavedPicture.
       */
      addItemToList: (item) => {
        if (item instanceof SavedPicture) {
          const existing = savedItemsList.find((pic) => pic.id === item.id);
          if (existing) {
            Dom.displayNotification(
              "bg-danger",
              `Picture: ${item.id} has already been saved.`
            );
          } else {
            savedItemsList.push(item);
            Dom.displayNotification("bg-success", "Picture saved successfully");
          }
        } else {
          throw new Error("can not add items not of type savedPicture");
        }
      },
      /**
       * Removes a saved picture object from the saved picture list.
       * @param {SavedPicture} item - The saved picture object to remove from the list.
       * @throws {Error} - If the item is not an instance of SavedPicture.
       * @throws {Error} - If the item is not found in the list.
       */
      removeItem: (item) => {
        if (item instanceof SavedPicture) {
          let index = savedItemsList.indexOf(item);
          if (index !== -1) {
            savedItemsList.splice(index, 1);
          } else {
            throw new Error(`Picture not found`);
          }
        } else {
          throw new Error(`Expected SavedPicture, got:${typeof item}`);
        }
        rendererModule.renderSavedPhotos();
      },
      /**
       * Returns the saved picture list as an HTML element.
       * @returns {HTMLElement} - The saved picture list as an HTML element.
       */
      getAsHtmlObj: () => {
        const listContainer = document.createElement("div");
        listContainer.className =
          "row d-flex justify-content-center align-items-center rounded m-2";

        savedItemsList.forEach((item) => {
          listContainer.appendChild(item.getAsHtmlObj());
        });

        return listContainer;
      },
      /**
       * Generates a carousel of the saved pictures and displays it on the story screen.
       * Also hides the generate story button if the list is empty.
       * @throws {Error} - If the saved picture list is empty.
       */
      generateCarousel: () => {
        const carouselImagesContainer =
          document.getElementById("carouselImages");
        const carouselButtonsContainer =
          document.getElementById("carouselIndicators");

        carouselImagesContainer.innerHTML = "";
        carouselButtonsContainer.innerHTML = "";

        savedItemsList.forEach((item, index) => {
          //add Image and content
          const imageToInsert = document.createElement("div");
          imageToInsert.classList.add("carousel-item");

          const imageElement = document.createElement("img");
          imageElement.src = item.imgSrc;
          imageElement.alt = item.id;
          imageElement.classList.add("d-block", "w-100");
          imageElement.style.width = "100%";
          imageElement.style.height = "80vh";
          imageElement.style.objectFit = "cover";

          const carouselCaption = document.createElement("div");
          carouselCaption.classList.add("carousel-caption");
          carouselCaption.innerHTML = `<h5>${item.rover}</h5>
                         <p>
                            ${item.description}
                         </p>
                         <a href="${item.imgSrc}" class="btn btn-light" target="_blank">Open</a>`;

          imageToInsert.appendChild(imageElement);
          imageToInsert.appendChild(carouselCaption);

          //add button
          const navigationButton = document.createElement("button");
          navigationButton.type = "button";
          navigationButton.setAttribute("data-bs-target", "#carousel-div");
          navigationButton.setAttribute("data-bs-slide-to", index);
          navigationButton.setAttribute("aria-label", `Slide ${index + 1}`);

          if (index === 0) {
            imageToInsert.classList.add("active");

            navigationButton.setAttribute("aria-current", "true");
            navigationButton.classList.add("active");
          }
          carouselImagesContainer.appendChild(imageToInsert);
          carouselButtonsContainer.appendChild(navigationButton);
        });
      },
      isListEmpty: () => savedItemsList.length === 0,
    };
  })();

  //---------------------------ON DOM LOAD ------------------------------------
  document.addEventListener("DOMContentLoaded", (event) => {
    UI.init();
  });
})();
