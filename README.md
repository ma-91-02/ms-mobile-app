# MS Mobile

A React Native mobile application built with Expo.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Code Quality Tools

### ESLint

This project uses ESLint to ensure code quality and consistency. The configuration is set up to enforce best practices for React Native and TypeScript.

#### Running ESLint

```bash
# Run ESLint to check for issues
npm run lint

# Run ESLint and automatically fix issues where possible
npm run lint:fix
```

#### ESLint Rules

The ESLint configuration includes rules for:

- React and React Native best practices
- TypeScript type checking
- Code style consistency
- Common coding errors

### Prettier

Prettier is configured to ensure consistent code formatting. It works together with ESLint.

#### Running Prettier

```bash
# Format all code files
npm run format
```

## VS Code Integration

The repository includes VS Code settings to integrate ESLint and Prettier. If you use VS Code, you'll get:

- Real-time linting as you code
- Format on save
- Recommended extensions

## Recommended VS Code Extensions

- ESLint
- Prettier
- React Native Tools
- TypeScript React code snippets

## Project Structure

- `app/`: Main application code
  - `components/`: Reusable UI components
  - `context/`: React context providers
  - `i18n/`: Internationalization files
  - `screens/`: Application screens
  - `services/`: API and other services
  - `utils/`: Utility functions
- `assets/`: Static assets like images and fonts
- `constants/`: App-wide constants
- `components/`: Global components

## Contributing

When contributing to this project, please follow these guidelines:

1. Follow the existing code style and structure
2. Run ESLint and fix any issues before committing: `npm run lint:fix`
3. Format your code with Prettier: `npm run format`
4. Write descriptive commit messages 