var json ={
    "legend": [
        {
            "typ": "People",
            "color": "#763b00aa",
            "enabled": true,
            "special": true,
            "isPeopleType": true // This is a special legend type, which is used to show the people on the map
        },
        {
            "typ": "Visited",
            "color": "#00E626aa",
            "enabled": true,
            "special": true,
            "isVisitedType": true // This is a special legend type, which is used to show the visited places on the map
        },
        {
            "typ": "Next unvisited",
            "color": "#ff0000aa",
            "enabled": true,
            "special": true,
            "isNextVisitType": true // This is a special legend type, which is used to show the next unvisited places on the map	
        },
        // All the other legend points are based on a category in the spreadsheet
        {
            "typ": "Closed",
            "color": "#ffa500aa",
            "enabled": true,
            "special": true,
            "isClosedType": true
        },
        {
            "typ": "Square",
            "color": "#00FFFFaa",
            "enabled": true
        },
        {
            "typ": "Museum",
            "color": "#e337deaa",
            "enabled": true        
        },{
            "typ": "Historic",
            "color": "#1940FFaa",
            "enabled": true
        }
    ],
    "html":{
        // The title of the page
        "title" : "Berlin Sightseeing Example",
        // Favicon of the page
        "favicon" : "/example/favicon.ico"
    },
    "map" : {
        // Where to center the map when opening the website
        "center": [13.414951, 52.507783],
        // The zoom level of the map
        "zoom" : 12,
        // The click accuracy of the points on the map
        "clickAccuracy": 6,
        // Mobile adjustments for the clickable points
        "mobile": {
            "pointRadius": 20,
            "pointBorderWidth": 3,
            "lineThinkness" : 8
        },
        // Desktop adjustments for the clickable points
        "desktop": {
            "pointRadius": 7,
            "pointBorderWidth": 2,
            "lineThinkness" : 4
        }
    },
    "person": {
        // The URL of the spreadsheet with the people, for reference look in the base directory for people.xlsx
        "url": "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0J013iLDrL-C6UPFbNDN6Ywj3VTF0m_rjZnZq9HeUig5_rpWOzZ-_kkuxH9GNaqnUbLuuMSoWhFgD/pub?output=tsv",
        "name": {
            // The field in the spreadsheet which contains the name of the persons
            "field": "Name"
        },
        "location": {
            // The field in the spreadsheet which contains the location of the persons
            "field": "Location"
        }
    },
    "points" : {
        // The URL of the spreadsheet with the points, for reference look in the base directory for points.xlsx
        "url": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTuglV4SAhum9jnz_Hwb8hYHakioFCUyqxMVSfRXzx8UXVDG9WNPpeKeUz4hYGIX5B4k822QqI0S6q_/pub?output=tsv",
        "tooltip": {
            "fieldsToShow":[
                // The fields in the spreadsheet which should be shown in the tooltip
                {
                    "field": "Type",
                    "shownName": "Type"
                }
            ]
        },
        "location": {
            // The field in the spreadsheet which contains the location of the points
            "field": "Location"
        },
        "date": {
            // The field in the spreadsheet which contains the date of the points
            "field": "Visited",
            // How it should be shown in the tooltip
            "shownName": "Visited",
            // The name of the corresponding legend type
            "legendType": "Visited"
        },
        "name": {
            // The field in the spreadsheet which contains the name of the points
            "field": "Name"
        },
        "closed":{
            // The field in the spreadsheet which contains the closed date of the points
            "field": "Closed",
            // The name of the corresponding legend type
            "legendType": "Closed"
        }
    }
    
}