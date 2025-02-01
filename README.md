# MoMo Connect

MoMo Connect is a web application designed to process and manage MTN Mobile Money (MoMo) SMS data. It provides a streamlined interface for handling MoMo transactions and generating insights from SMS notifications.

## Features

- Process MTN MoMo SMS data
- Store transaction information in a structured database
- RESTful API for data access and management
- User-friendly web interface

## Tech Stack

### Backend
- Node.js
- Express.js
- MySQL
- XML2JS for SMS parsing

### Frontend
- React.js (planned)
- Material-UI (planned)

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd momo-connect
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=8000
   DB_HOST=localhost
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=momo_connect
   ```

## Running the Application

### Development Mode
```bash
cd backend
npm run dev
```

### Production Mode
```bash
cd backend
npm start
```

The server will start on http://localhost:8000

## API Endpoints

### Base URL
```
http://localhost:8000
```

### Available Endpoints

- `GET /` - Welcome message and API status
- Additional endpoints will be documented as they are implemented

## Development

### Running Tests
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.