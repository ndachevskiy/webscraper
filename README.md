# Intro

This API allows to export list of restaurants at particular city or menu items of particular restaurant to the Google Docs (data taken from Wolt API).

# Running in container

Make sure you Docker application is running, then hit:

`docker-compose up`

# Endpoints

/api/parsedata - scrapes, parses and saves data to MongoDB (request body example: {"cities":"city1,city2,..."}, all without diacritics).

/api/getrestaurants - exports restaurants data - all restaurants from particular city (request body example  {"city":"city"}, name of a city should be with diacritics)

/api/getmenus - exports menu items from particular restaurant (request body example: {"restaurantId":"id-konkretni-restaurace"}, where 'restaurantId' is the last part of URL of a restaurant's page on Wolt).
