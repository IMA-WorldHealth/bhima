This folder contains integration tests for validating the output of reports 
based on a known dataset (`development-data.sql`). It is set up as a parrallel 
testing framework until integration and end to end tests have been refactored to 
correctly build the database on every test run individually. 

These reports should not alter the database in any way but should be used as a
strict validation/ regression tests against core reports. 

This folder should be removed and these tests moved under `/integration/` once 
test runners and procedures are updated.
