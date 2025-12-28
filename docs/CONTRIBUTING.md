# Contributing to SoulSync AI

Thank you for your interest in contributing to SoulSync! This document provides guidelines and instructions for contributing to the project.

## 🌟 Ways to Contribute

- 🐛 **Report bugs** - Found a bug? Open an issue
- ✨ **Suggest features** - Have an idea? We'd love to hear it
- 📝 **Improve documentation** - Help make our docs better
- 🔧 **Submit code** - Fix bugs or implement features
- 🧪 **Write tests** - Increase code coverage
- 🎨 **Design improvements** - Enhance UI/UX

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/SoulSync.git
cd SoulSync
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/Aryan-B-Parikh/SoulSync.git
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions

### 5. Install Dependencies

```bash
npm install
cd client && npm install && cd ..
```

### 6. Set Up Environment

```bash
cp .env.example .env
# Add your API keys
```

## 💻 Development Workflow

### Running the Application

```bash
# Run both frontend and backend
npm run dev

# Run only backend
npm run server:dev

# Run only frontend
cd client && npm start
```

### Making Changes

1. **Write clean, readable code**
   - Follow existing code style
   - Add comments for complex logic
   - Use meaningful variable names

2. **Follow the architecture**
   - Frontend: Components in `client/src/components/`
   - Backend: Services in `server/services/`
   - Keep concerns separated

3. **Test your changes**
   ```bash
   npm test
   ```

4. **Lint your code**
   ```bash
   npm run lint
   ```

### Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

**Format**:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```bash
git commit -m "feat(chat): add markdown support for messages"
git commit -m "fix(server): resolve rate limiting memory leak"
git commit -m "docs(api): update endpoint documentation"
```

## 📋 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Documentation updated (if needed)
- [ ] No console errors or warnings
- [ ] Commit messages follow conventions

### Submitting a PR

1. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Description Should Include**:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots (for UI changes)
   - Related issue numbers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests pass
```

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the issue already exists
2. Try to reproduce the bug
3. Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]

**Additional context**
Any other relevant information
```

## ✨ Suggesting Features

### Feature Request Template

```markdown
**Is your feature related to a problem?**
Description of the problem

**Describe the solution**
What you'd like to happen

**Describe alternatives**
Alternative solutions considered

**Additional context**
Mockups, examples, etc.
```

## 🎨 Code Style Guidelines

### JavaScript/React

```javascript
// Use const/let, not var
const apiUrl = '/api/chat';

// Destructure props
const MessageBubble = ({ message, sender }) => {
  // Component code
};

// Use arrow functions
const handleClick = () => {
  // Handler code
};

// Use template literals
const greeting = `Hello, ${name}!`;

// Async/await over .then()
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Component Structure

```javascript
/**
 * Component description
 * @param {Object} props - Component props
 */
const ComponentName = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState(initial);
  const customHook = useCustomHook();

  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Backend Style

```javascript
/**
 * Function description
 * @param {Type} param - Parameter description
 * @returns {Type} Return description
 */
async function functionName(param) {
  try {
    // Function logic
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

module.exports = { functionName };
```

## 🧪 Testing Guidelines

### Writing Tests

```javascript
// Component test example
describe('MessageBubble', () => {
  it('renders user message correctly', () => {
    const message = { sender: 'user', text: 'Hello' };
    render(<MessageBubble message={message} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies correct styling for user messages', () => {
    // Test styling
  });
});

// API test example
describe('POST /api/chat', () => {
  it('returns AI response for valid input', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ messages: [{ role: 'user', content: 'test' }] });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
});
```

### Test Coverage

- Aim for 80%+ code coverage
- Test happy paths and error cases
- Test edge cases and boundary conditions
- Mock external API calls

## 📚 Documentation Guidelines

### Code Comments

```javascript
// Good: Explains WHY
// Using setTimeout to avoid race condition with state updates
setTimeout(() => setLoading(false), 0);

// Bad: Explains WHAT (obvious from code)
// Set loading to false
setLoading(false);
```

### JSDoc Comments

```javascript
/**
 * Send a chat message to the AI service
 * @param {Array<Object>} messages - Conversation history
 * @param {Object} config - API configuration
 * @returns {Promise<string>} AI-generated response
 * @throws {Error} If API request fails
 */
async function generateResponse(messages, config) {
  // Implementation
}
```

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the issue, not the person
- Help create a positive environment

### Communication

- **Issues**: For bugs and feature requests
- **Pull Requests**: For code contributions
- **Discussions**: For questions and ideas

## 🎓 Learning Resources

### React
- [React Official Docs](https://react.dev/)
- [React Hooks](https://react.dev/reference/react)

### Node.js/Express
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Testing
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)

## 📞 Getting Help

- Open an issue for bugs
- Use GitHub Discussions for questions
- Read existing documentation
- Check closed issues/PRs for similar problems

## 🏆 Recognition

Contributors will be:
- Listed in the project README
- Credited in release notes
- Given recognition in the community

Thank you for contributing to SoulSync! Together we can build something amazing. 🌟
