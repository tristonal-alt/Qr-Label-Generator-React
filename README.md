# QR Code Label Generator

A modern, production-ready React application for generating printable QR code labels with warehouse and inventory information. Built with TypeScript, React 19, and Tailwind CSS.

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![Vite](https://img.shields.io/badge/Vite-6.2-646cff)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- ✅ Generate QR codes with warehouse inventory data
- ✅ Customizable QR code size (100px - 500px)
- ✅ Adjustable text size (8px - 24px)
- ✅ Real-time preview
- ✅ Print-optimized layout
- ✅ Comprehensive input validation
- ✅ Accessibility support (ARIA labels, keyboard navigation)
- ✅ Responsive design (mobile & desktop)
- ✅ TypeScript strict mode
- ✅ Production-ready build

## Tech Stack

- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 6.2
- **Styling**: Tailwind CSS 3.4
- **QR Generation**: qrcode library
- **Code Quality**: ESLint + Prettier
- **Type Checking**: TypeScript with strict mode

## Quick Start

```bash
# Clone the repository
git clone https://github.com/tristonal-alt/Qr-Label-Generator-React.git
cd Qr-Label-Generator-React

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser at http://localhost:3000
```

## Documentation

- 📖 **[SETUP.md](./SETUP.md)** - Complete setup guide
- 🗄️ **[SQL_INTEGRATION.md](./docs/SQL_INTEGRATION.md)** - Database integration guide
- 🚀 **[API_EXAMPLES.md](./docs/API_EXAMPLES.md)** - Backend API examples

## Project Structure

```
Qr-Label-Generator-React/
├── components/          # React components
│   ├── InputField.tsx   # Reusable input component
│   ├── LoadingSpinner.tsx
│   └── QrCodeDisplay.tsx
├── constants/           # Configuration constants
│   └── index.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── validation.ts   # Input validation logic
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── index.css           # Global styles & print CSS
└── docs/               # Documentation
    ├── SQL_INTEGRATION.md
    └── API_EXAMPLES.md
```

## Available Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript type checking
npm run lint         # Lint code with ESLint
npm run lint:fix     # Lint and auto-fix issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## Usage

### Basic Usage

1. **Enter Inventory Data**:
   - Stock Code (e.g., `TEST-SKU-001`)
   - Warehouse (e.g., `MAIN-WH`)
   - Bin Location (e.g., `A1-R2-S3`)
   - Product Class (e.g., `Electronics`)

2. **Customize Appearance**:
   - Adjust QR code size (100px - 500px)
   - Adjust text size (8px - 24px)

3. **Generate & Print**:
   - Click "Generate QR Code" or press Enter
   - Review preview
   - Click "Print Label"

### QR Code Data Format

```
[S]<StockCode>[W]<Warehouse>[B]<Bin>[P]<ProductClass>
```

Example: `[S]TEST-SKU-001[W]MAIN-WH[B]A1-R2-S3[P]Electronics`

## Configuration

Edit `constants/index.ts` to customize defaults, validation patterns, and QR code settings.

## Backend Integration

This is currently a frontend-only application. To integrate with a backend:

1. **See [SETUP.md](./SETUP.md)** for detailed setup instructions
2. **See [SQL_INTEGRATION.md](./docs/SQL_INTEGRATION.md)** for database integration
3. **See [API_EXAMPLES.md](./docs/API_EXAMPLES.md)** for API implementation examples

## Browser Support

Chrome/Edge 90+, Firefox 88+, Safari 14+, Opera 76+

## Performance

- Build size: ~230KB JS (gzipped: 74KB)
- CSS size: ~12KB (gzipped: 3KB)
- First Contentful Paint: < 1s

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License

## Support

For issues and questions:
- Open an issue on GitHub
- Check [SETUP.md](./SETUP.md) for troubleshooting

---

Made with ❤️ by [tristonal-alt](https://github.com/tristonal-alt)
