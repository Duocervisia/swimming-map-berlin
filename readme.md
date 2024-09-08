# Map Viewer
This project is a web-based map viewer application that displays points of interest that you might want to visit. The data for this application is pulled from Google Spreadsheets. It includes a legend, statistics section, and navigation controls to interact with the map.

![Map Viewer Website](map-viewer.jpg?raw=true)

## Table of Contents

- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Features

- Interactive Map: Displays a map with various layers and data points.
- Legend: Provides a legend to explain the symbols used on the map.
- Statistics: Shows statistics such as visited locations, last visited, and next unvisited location.
- Navigation Controls: Allows users to navigate through different data points on the map.

## Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/map-viewer.git
    ```

2. Install dependencies:
    Ensure you have Node.js installed, then run:
    ```sh
    npm install
    ```

3. In the `public/example` directory, change the `data.json` file to fit your needs. You need to change the Google spreadsheet links to your own. The structures for the spreadsheets can be seen in the `spreadsheets` directory in `example.xlsx` and `peoples.xlsx`. The spreadsheets need to be shared as `.tsv` files. This can be done in Google Spreadsheets under "File" -> "Share" -> "Publish to web". Under link select "Entire Document" and "TSV". Click on "Publish" and copy the link in the JSON file. Do this for both spreadsheets.

4. Adapt other JSON parameters. For more explanations on the parameters, go to the `data-json-with-comments.js` file.

5. Run the application:
    ```sh
    npm start
    ```

## License

This project is licensed under the MIT License.