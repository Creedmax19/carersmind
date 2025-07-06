# Contributing to Carer's Care CIC Backend

Thank you for your interest in contributing to Carer's Care CIC! We appreciate your time and effort in making our project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [License](#license)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
   ```bash
   git clone https://github.com/your-username/carers-care-cic.git
   cd carers-care-cic/server
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment variables**
   ```bash
   cp config/config.env.example config/config.env
   ```
   Then edit the `config.env` file with your configuration.

5. **Run the development server**
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a new branch** for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-number-description
   ```

2. **Make your changes** following the code style guidelines

3. **Run tests** (when available)
   ```bash
   npm test
   ```

4. **Commit your changes** with a descriptive commit message
   ```bash
   git add .
   git commit -m "Add: your feature description"
   ```

5. **Push your changes** to your fork
   ```bash
   git push origin your-branch-name
   ```

6. **Open a Pull Request** on GitHub

## Code Style

- Use **ES6+** syntax
- Follow **Airbnb JavaScript Style Guide**
- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and constructors
- Use **UPPERCASE** for constants
- Use **descriptive variable and function names**
- Add **JSDoc** comments for functions and classes
- Keep lines under **100 characters**
- Add **unit tests** for new features

## API Documentation

We use **Swagger/OpenAPI** for API documentation. The documentation is automatically generated from JSDoc comments in the route files.

To view the API documentation:

1. Start the development server
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5000/api-docs
   ```

## Testing

We use **Jest** for testing. To run the tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm test -- --watch
```

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## Reporting Issues

When reporting issues, please include the following:

1. **Description** of the issue
2. **Steps to reproduce** the issue
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** (if applicable)
6. **Environment** (OS, browser, Node.js version, etc.)

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
