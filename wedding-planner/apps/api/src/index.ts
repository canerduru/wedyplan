import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes';
import { onboardingRouter } from './routes/onboarding.routes';
import { vendorRouter } from './routes/vendor.routes';
import { budgetRouter } from './routes/budget.routes';
import { guestRouter } from './routes/guest.routes';
import { seatingRouter } from './routes/seating.routes';
import { marketplaceRouter } from './routes/marketplace.routes';
import { taskRouter } from './routes/task.routes';
import { scheduleRouter } from './routes/schedule.routes';
import { designRouter } from './routes/design.routes';
import { websiteRouter } from './routes/website.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourusername.github.io'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/vendor', vendorRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/guests', guestRouter);
app.use('/api/seating', seatingRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api', designRouter); // Design routes like /mood-boards
app.use('/api/wedding-website', websiteRouter); // Specific prefix for website builder

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Something went wrong'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
