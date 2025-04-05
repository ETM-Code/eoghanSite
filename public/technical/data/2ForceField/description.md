# ForceField

**ForceField** is a product of the Patch 2024 Youth Accelerator. It is an impact-detecting sensor designed for hurling helmets to assist in the detection and diagnosis of concussions in hurling.

## Code Sections

The relevant code is split into three sections:
1. **Sensor Code**
2. **Access Point Code**
3. **App Code**

## Transmission Setup

Communication is essential for this application, as real-time data is required for on-the-fly decisions during a hurling game. Range limitations are unacceptable, so a mesh-network approach was chosen to ensure consistent data receipt. Each player boosts the signal, allowing the access point, and thereby the user, to always receive the relevant data.

Several open-source mesh-network libraries were considered, but their reliance on ineffective dynamic memory allocation made them unsuitable due to the memory demands of the ESP-32s being used. Consequently, a custom mesh network was developed. In this setup, each node listens for a (currently hardcoded) setup message that triggers peer-assignment, effectively joining the node to the mesh network. This setup message is sent by the access point.

Messages are chunked to avoid the limits of the ESP-Now service and tagged to identify the original transmitter, as well as the relevant message and section of the message.

Our transmission methods were extremely effective, allowing 6,000 datapoints to be transmitted, per-second, at a maximum range of 100m per active peer (the  network allows for the extension of range via device meshing). This is opposed to competitors utilising BLE for ranges of less than 20m.

## Data Gathering

The sensors collect data from the Adafruit ADXL375 High-G Accelerometer and the LSM6DSOX Gyroscope Sensor. The data rates are adjusted for compatibility before being stored in buffer arrays. These arrays are periodically checked for heavy impacts. If an impact is detected, a message is broadcast.

## Data Analysis

The access point performs further checks on the data for debugging purposes before passing it on via web-socket to the app. On the app, each player is identified (currently by MAC address, though this is customizable). Historical impacts can be viewed in a convenient summary or on an actionable graph.

Impacts are categorized according to a formula developed by Campolettano et al. in their paper, "Development of a Concussion Risk Function for a Youth Population Using Head Linear and Rotational Acceleration."

The data can be recollected at any time through the app's "Load Session" capability, allowing for future reference by medical professionals.
