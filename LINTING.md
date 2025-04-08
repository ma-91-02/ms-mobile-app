# Linting Guide for MS Mobile

This document provides guidance on working with the linting rules in this project.

## Common Issues and How to Fix Them

Based on the ESLint output, here are the most common issues in the codebase and how to fix them:

### 1. Unexpected console statements

```javascript
// Bad
console.log('Debug info');

// Good
// Remove console statements in production code, or use a logger service
```

### 2. Inline styles

```jsx
// Bad
<View style={{ marginLeft: 10, flex: 1 }}>

// Good
const styles = StyleSheet.create({
  container: {
    marginLeft: 10,
    flex: 1,
  },
});

<View style={styles.container}>
```

### 3. Color literals

```jsx
// Bad
<View style={{ backgroundColor: '#FFFFFF' }}>

// Good
// Define colors in constants
import { appColors } from '../constants/AppColors';

<View style={{ backgroundColor: appColors.white }}>
```

### 4. TypeScript any type

```typescript
// Bad
function process(data: any) {

// Good
interface Data {
  id: string;
  name: string;
}

function process(data: Data) {
```

### 5. Missing React Hook dependencies

```jsx
// Bad
useEffect(() => {
  fetchData();
}, []); // Missing dependency: fetchData

// Good
useEffect(() => {
  fetchData();
}, [fetchData]);
```

## RTL Support Best Practices

Since the app supports RTL languages, use these patterns:

```jsx
// For flexDirection
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Will be automatically flipped in RTL
  },
});

// For margins and paddings
const styles = StyleSheet.create({
  container: {
    marginStart: 10, // Use marginStart instead of marginLeft
    marginEnd: 10, // Use marginEnd instead of marginRight
    paddingStart: 10,
    paddingEnd: 10,
  },
});
```

## Automated Fixes

For many issues, you can use the automated fix command:

```bash
npm run lint:fix
```

However, some issues require manual fixes, especially:

1. React Hook dependency warnings
2. Unused variables
3. Type definitions for `any` types

## Ignoring Rules in Specific Cases

If you need to ignore a rule in a specific case:

```javascript
// eslint-disable-next-line no-console
console.log('Important debugging info');

// Or for a block of code
/* eslint-disable react-native/no-inline-styles */
const component = (
  <View style={{ margin: 10 }}>
    <Text style={{ fontSize: 16 }}>Text</Text>
  </View>
);
/* eslint-enable react-native/no-inline-styles */
```

## VS Code Tips

1. Install the ESLint extension
2. Enable "Format on Save" in your settings
3. Use the "Problems" panel to quickly navigate to linting issues

Remember: The goal of linting is to improve code quality and consistency, making the codebase more maintainable for everyone. 