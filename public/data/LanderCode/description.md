# Capsule Telemetry Gatherer

## Introduction

This project was created as part of a university assignment, where students were tasked with designing and constructing water rockets and suitable capsules to house standardized sensors.

The sensors used an ADXL335 accelerometer and a BMP280 environmental sensor (capable of reading temperature and atmospheric pressure) to gather all telemetry. This data was then processed to create an accurate picture of the physical effects and trajectories experienced by the capsule, or more precisely, the sensor within.

## Sensors

As the chief software engineer for this project, I developed the telemetry system using data from the sensors, which included:

- **Linear acceleration** in x, y, z axes
- **Vertical acceleration**
  - Due to the lack of a gyroscope, it was assumed that the rocket only experienced vertical forces. Vector mathematics was used to determine the angle of verticality, allowing for the calculation of vertical acceleration.
- **Linear velocity** (calculated using timestamps transmitted with the data and utilizing acceleration values)
- **Vertical velocity**
- **Temperature**
- **Pressure**
- **Altitude** (calculated both using vertical velocity and timestamps, as well as the hypsometric formula; both outputs were provided for comparison)
- **Launch, descent, and landing time** (determined using relative acceleration)
- **Local maxima and minima** of the various values

## Data Transmission

Data transmission was optimized by utilizing custom data encoding to accommodate the transmission limits of Software Serial, which the radio transmitter was connected to. These limits imposed a maximum baud rate of 9600.

To enhance transmission efficiency, all data was compressed to its smallest possible size and sent with a small identifier to properly align the data. This involved converting most values to 8-bit integers or smaller and assuming certain limits to sensor fluctuations. As a result, the transmission speed increased by 606% compared to the originally recommended protocol.

## Data Graphing

The project required data to be displayed on a serial monitor. Due to the lack of support for the recommended serial monitor on macOS and the inability of other monitors to handle my custom-encoded data, I developed my own solution using Matplotlib.

This approach was superior, as it allowed the data to be synced to timestamp values rather than the computer time used by other serial plotters. It also provided complete freedom in how the graphs were displayed.

## Data Storage

Data storage for this project was straightforward. All data was periodically saved to `.pkl` files, facilitating easy and efficient reading by Python scripts. Additionally, all data was saved to an Excel spreadsheet, enabling further, convenient viewing and analysis.