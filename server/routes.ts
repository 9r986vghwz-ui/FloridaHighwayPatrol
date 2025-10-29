import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertReportSchema, insertStrikeSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Extend Express Request to include user
interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Auth middleware
const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// Supervisor middleware
const requireSupervisor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== "supervisor") {
    return res.status(403).json({ message: "Forbidden: Supervisor access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // ========== Authentication Routes ==========
  
  // Register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Check if badge number already exists
      const existingBadge = await storage.getUserByBadgeNumber(validatedData.badgeNumber);
      if (existingBadge) {
        return res.status(400).json({ message: "Badge number already in use" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user (pending status by default)
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        message: "Registration successful. Awaiting supervisor approval.",
        user: userWithoutPassword,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        token,
        user: userWithoutPassword,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // ========== Trooper Routes ==========

  // Get my reports
  app.get("/api/reports/my-reports", authenticate, async (req: AuthRequest, res: Response) => {
    try {
      const reports = await storage.getReportsByUserId(req.userId!);
      res.json(reports);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Get my strikes
  app.get("/api/strikes/my-strikes", authenticate, async (req: AuthRequest, res: Response) => {
    try {
      const strikes = await storage.getStrikesByUserId(req.userId!);
      res.json(strikes);
    } catch (error: any) {
      console.error("Error fetching strikes:", error);
      res.status(500).json({ message: "Failed to fetch strikes" });
    }
  });

  // Submit a report
  app.post("/api/reports", authenticate, async (req: AuthRequest, res: Response) => {
    try {
      // Check if user is approved
      const user = await storage.getUser(req.userId!);
      if (!user || user.status !== "approved") {
        return res.status(403).json({ message: "Only approved troopers can submit reports" });
      }

      const validatedData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(req.userId!, validatedData);
      
      res.status(201).json(report);
    } catch (error: any) {
      console.error("Error creating report:", error);
      res.status(400).json({ message: error.message || "Failed to create report" });
    }
  });

  // ========== Supervisor Routes ==========

  // Get pending profiles
  app.get("/api/supervisor/pending-profiles", authenticate, requireSupervisor, async (req: AuthRequest, res: Response) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error: any) {
      console.error("Error fetching pending profiles:", error);
      res.status(500).json({ message: "Failed to fetch pending profiles" });
    }
  });

  // Approve profile
  app.post("/api/supervisor/approve-profile/:userId", authenticate, requireSupervisor, async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const user = await storage.approveUser(userId, req.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Profile approved successfully", user });
    } catch (error: any) {
      console.error("Error approving profile:", error);
      res.status(500).json({ message: "Failed to approve profile" });
    }
  });

  // Deny profile
  app.post("/api/supervisor/deny-profile/:userId", authenticate, requireSupervisor, async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      if (!reason || !reason.trim()) {
        return res.status(400).json({ message: "Denial reason is required" });
      }

      const user = await storage.denyUser(userId, reason);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Profile denied successfully", user });
    } catch (error: any) {
      console.error("Error denying profile:", error);
      res.status(500).json({ message: "Failed to deny profile" });
    }
  });

  // Get pending reports
  app.get("/api/supervisor/pending-reports", authenticate, requireSupervisor, async (req: AuthRequest, res: Response) => {
    try {
      const pendingReports = await storage.getPendingReports();
      res.json(pendingReports);
    } catch (error: any) {
      console.error("Error fetching pending reports:", error);
      res.status(500).json({ message: "Failed to fetch pending reports" });
    }
  });

  // Review report
  app.post("/api/supervisor/review-report/:reportId", authenticate, requireSupervisor, async (req: AuthRequest, res: Response) => {
    try {
      const { reportId } = req.params;
      const { status, notes } = req.body;

      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      const report = await storage.reviewReport(reportId, req.userId!, status, notes || "");
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json({ message: `Report ${status} successfully`, report });
    } catch (error: any) {
      console.error("Error reviewing report:", error);
      res.status(500).json({ message: "Failed to review report" });
    }
  });

  // Get approved troopers (for strike assignment)
  app.get("/api/supervisor/troopers", authenticate, requireSupervisor, async (req: AuthRequest, res: Response) => {
    try {
      const troopers = await storage.getApprovedTroopers();
      res.json(troopers);
    } catch (error: any) {
      console.error("Error fetching troopers:", error);
      res.status(500).json({ message: "Failed to fetch troopers" });
    }
  });

  // Issue strike
  app.post("/api/supervisor/issue-strike", authenticate, requireSupervisor, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertStrikeSchema.parse(req.body);
      const userId = req.body.userId;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Verify trooper exists and is approved
      const trooper = await storage.getUser(userId);
      if (!trooper) {
        return res.status(404).json({ message: "Trooper not found" });
      }
      if (trooper.status !== "approved") {
        return res.status(400).json({ message: "Can only issue strikes to approved troopers" });
      }

      const strike = await storage.createStrike({
        ...validatedData,
        userId,
        issuedBy: req.userId!,
      });

      res.status(201).json({ message: "Strike issued successfully", strike });
    } catch (error: any) {
      console.error("Error issuing strike:", error);
      res.status(400).json({ message: error.message || "Failed to issue strike" });
    }
  });

  // Get stats
  app.get("/api/supervisor/stats", authenticate, requireSupervisor, async (req: AuthRequest, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
