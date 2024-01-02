RELEASES
--------

Releases are partially automated in BHIMA.  This document is a checklist of things that need to be done
before a release and the steps to creating a new release.

1. Checkout 'master' and do `git pull` to make sure it is up-to-date.
2. Make a new branch called `release-next` that is based on `upstream/master` to do your release on.  If one exists on upstream, remove it first.
3. Run `yarn` to ensure you have the latest dependencies.
4. (Optional, best practice) Test the latest migration script on a production database. (See * below)
5. (Optional, best practice) Build the application in production mode with `NODE_ENV=production yarn build`.
6. Determine the version number for the next version (eg, `v1.X.Y`)
7. Create a new folder in the `server/models/migrations/` directory to hold the migration file with the format `v1.A.B-v1.X.Y` where `1.A.B` is the current version and `v1.X.Y` is the next version.
8. Move the `server/models/migrations/next/migrate.sql` file to the directory created in the previous step.
9. Create an empty `migrate.sql` file in `server/models/migrations/next/`.  You may insert a comment at the top of the file including the name of the new release version.
10. Commit updated files (`git commit ...`)
11. Make sure your personal GITHUB_TOKEN environment variable is defined
    (assuming you have permissions to update the main BHIMA repository.  [See Github instructions for this.](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
12. Run `yarn release` and follow the directions.
13. Verify the release was created and that the binary <version>.tar.gz file
    is in the assets for the release.


(*) Optional, Best Practice: Test the latest database changes on a production database.

1. Change your `.env` so the `$DB_NAME` variable is the correct one for a production database.
2. Create your database migration script by running `yarn migrate`.  This will create a file `migration-$DB_NAME.sql`.
3. Concatenate the latest release file into the output `cat server/models/migrations/next/migrate.sql >> migration-$DB_NAME.sql`.
4. Build the migration script targetting your database. `mysql $DB_NAME < migration-$DB_NAME.sql`
5. If no errors occur, remove the file `migration-$DB_NAME.sql` to prevent it from getting checked into SQL.
