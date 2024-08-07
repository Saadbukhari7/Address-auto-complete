const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();  // Load environment variables from .env file
const app = express();
const PORT = process.env.PORT || 3000;

// Retrieve API keys from the environment variable
const apiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/get-script', (req, res) => {
    const { apiKey } = req.body;

    // Validate the API key
    if (!apiKey || !apiKeys.includes(apiKey)) {
        return res.status(400).send('Invalid or missing API key');
    }

    // Serve the JavaScript content
    const scriptContent = `
        var street, city, state, country, postal, input, autocomplete, place;

        function initialize() {
            input = document.getElementsByName('address')[0];
            autocomplete = new google.maps.places.Autocomplete(input);
            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                updateAddressComponents();
                setTimeout(() => {
                    closeAutocomplete();
                }, 200);
            });

            input.addEventListener('blur', function() {
                setTimeout(function() {
                    input.blur();
                }, 200);
            });
        }

        function updateAddressComponents() {
            place = autocomplete.getPlace();
            extractAddressComponents();

            let addressInput = document.getElementsByName('address')[0];
            addressInput.value = street;
            addressInput.dispatchEvent(new Event('input'));

            let cityInput = document.getElementsByName('city')[0];
            cityInput.value = city;
            cityInput.dispatchEvent(new Event('input'));

            let stateInput = document.getElementsByName('state')[0];
            stateInput.value = state;
            stateInput.dispatchEvent(new Event('input'));

            let postalInput = document.getElementsByName('postal_code')[0];
            postalInput.value = postal;
            postalInput.dispatchEvent(new Event('input'));

            let countryInput = document.getElementsByName('country')[0];
            countryInput.value = country === 'USA' ? 'United States' : country;
            countryInput.dispatchEvent(new Event('input'));

            updateCountryMultiselect();
        }

        function extractAddressComponents() {
            street = '';
            city = '';
            state = '';
            country = '';
            postal = '';

            if (place.name) {
                street = place.name;
            }

            for (var i = 0; i < place.address_components.length; i++) {
                var component = place.address_components[i];
                var componentType = component.types[0];

                if (componentType === 'street_number' || componentType === 'route' || componentType === 'premise' || componentType === 'neighborhood' || componentType === 'sublocality_level_1') {
                    street = street || component.long_name;
                } else if (componentType === 'locality') {
                    city = component.long_name;
                } else if (componentType === 'administrative_area_level_1') {
                    state = component.short_name;
                } else if (componentType === 'postal_code') {
                    postal = component.long_name;
                } else if (componentType === 'country') {
                    country = component.long_name;
                }
            }
        }

        function updateCountryMultiselect() {
            let multiselectElements = document.getElementsByClassName('multiselect__element');
            for (let i = 0; i < multiselectElements.length; i++) {
                let span = multiselectElements[i].getElementsByTagName('span')[0];
                if (span && span.innerText === (country === 'USA' ? 'United States' : country)) {
                    let option = multiselectElements[i].getElementsByClassName('multiselect__option')[0];
                    if (option) {
                        option.dispatchEvent(new Event('click'));
                    }
                }
            }
        }

        function closeAutocomplete() {
            var event = new Event('blur');
            input.dispatchEvent(event);
        }

        function reinitialize() {
            google.maps.event.clearInstanceListeners(input);
            let addressInput = document.getElementsByName('address')[0];
            addressInput.value = addressInput.value.split(', ')[0];
            addressInput.dispatchEvent(new Event('input'));
            initialize();
        }

        initialize();
    `;

    res.type('application/javascript').send(scriptContent);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
