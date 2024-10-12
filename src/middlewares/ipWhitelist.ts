import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import dotenv from '../config/dotenv';

// Load whitelisted IPs from environment variables or use a default list
const whitelistedIPs =
  dotenv.whitelistIps && dotenv.whitelistIps.length
    ? dotenv.whitelistIps.split(',').map((ip) => ip.trim())
    : ['192.168.1.1', '203.0.113.0'];

// Check if all IPs are allowed
const isAllowAll = dotenv.isAllowAll === 'true';

export const ipWhitelist = (req: Request, res: Response, next: NextFunction): void => {
  // If all IPs are allowed, skip the whitelist check
  if (isAllowAll) {
    return next();
  }

  // Extract IP(s) from 'x-forwarded-for' header or use req.ip
  const forwardedFor = req.headers['x-forwarded-for'];
  const requestIP = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || req.ip;

  // Check if the request's IP is in the whitelist
  if (whitelistedIPs.includes(requestIP as string)) {
    next();
  } else {
    // IP is not whitelisted, return a 403 response
    logger.warn(`Access denied for IP: ${requestIP}`);
    res.status(403).json({
      success: false,
      message: 'Access denied: Your IP is not whitelisted.',
    });
  }
};
