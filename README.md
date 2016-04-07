## Content Performance Policy Extension

Extension to notify performance issues according to an all rules on CPP.

### Development

#### Prerequisites
- [NodeJS](https://nodejs.org/en/) -- The runtime the application requires

#### Setting up development environment
- Clone the repository -- `git clone git@github.com:ftlabs/perf-widget.git`
- Change in repository directory -- `cd perf-widget`
- Install the dependencies -- `npm install`
- Build the files used by the web client -- `npm run build`
- Spin up the web server -- `npm start`
- Add extension to browser and browse to a website

### Day-to-Day Development
When developing you may want to have the server restart and client files rebuilt on any code changes. This can be done with the `develop` npm script -- `npm run develop`.

#### Tasks
- Build the application -- `npm run build`
- Lint the files -- `npm run lint`
- Start the application -- `npm run start`
- Start the application and build the application whenever a file changes -- `npm run develop`
