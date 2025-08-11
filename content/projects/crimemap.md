---
title: "crimemap"
date:
draft: false
tags: ["Python", "CyberCrime", "Crime", "Open-Source"]
link: "https://github.com/sarangvehale/map-this"
---

An interactive web application built with Streamlit and Folium to visualize and filter crime data across India. The app maps individual crime incidents using police station geolocation data and overlays them on state and district boundaries for contextual insight.

## About the Project

`crime-map` was created to visualize the spatial distribution of crime incidents using real-world geospatial and law enforcements data. It combines data preprocessing, geographic mapping, and UI design to allow filtering by lcoation, crimetype, and complaint date.

### Core Features

- **Filter crimes by**:
  - Date range
  - State, District, Police Station
  - Crime Category and Subcategory
- **Live Map Display:**
  - Crimes displayed as markers with contextual popups
  - Clustered markers for better readability
  - Dynamic zoom based on filter granularity
- **GeoJSON Overlay:**
  - Highlights selected state or district boundaries
  - Supports state and district level shapefiles
- **Missing Coordinate Handling:**
  - Matches crimes to police station coordinates
  - Approximate missing lcoations using district/state centroids.

### Tech Stack

- **Frontend/UI**: [Streamlit](https://streamlit.io/)
- **Mapping**: [Folium](https://folium.readthedocs.io/en/latest/)
- **Geospacial Data**: [GeoJSON](https://pypi.org/project/geojson/), [streamlit-folium](https://folium.streamlit.app/)
- **Data Processing**: [Pandas](https://pandas.pydata.org/)

## Getting Started

To run this app locally:

```bash
git clone https://github.com/SarangVehale/map-this.git
cd map-this
cd map13-final
streamlit run app.py    # Or in this case feature_10_final.py
```

---

MIT License © 2025

---
