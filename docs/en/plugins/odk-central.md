# ODK Central Plugin

This section describes an optional plugin to BHIMA to allow limited interoperability with [ODK Central](https://docs.getodk.org/central-setup/).

## Overview
The ODK Central plugin was built to allow the offline registration of stock entries in BHIMA.  It uses [ODK Central's API](https://odkcentral.docs.apiary.io/) to create
projects, app users, and forms in ODK Central with data from BHIMA, then download submissions to create stock movements in BHIMA.

### Getting Started
To allow BHIMA to perform automatic operations, the BHIMA server needs to have a super user account on the ODK Central server.  If a user does not exist, create one
on ODK Central first.  It is important that this user have the privilege to create a project on ODK Central, as a new project will be created for the BHIMA instance.

All the configuration takes place in the module `Administration > ODK Settings`.  You'll need to add in the **ODK Central Server URL**, the **ODK Central Admin Email**,
and **ODK Central Admin Password**.  Unfortunately, ODK Central does not yet provide a permanent API key to allow for administrative operations so we are required to
store the password locally.  The process only needs to be done once as the credentials will be saved.

### Synchronising Data
BHIMA will synchronize the following data elements between ODK Central and BHIMA:

1. `Sync Enterprise` -The BHIMA enterprise will become a new ODK Central project.  The enteprise name will be the project name in Central.
2. `Sync Users` - For each BHIMA user with access to a depot, BHIMA will create an App User on the Central Server.
3. `Sync Forms` - An ODK form is created with all the depots, current transfers to other depots, and lots in stock.  All App Users are given access to this form.
4. `Sync Submissions` - All submissions to the above form are pulled and inserted into the database as stock entries.
