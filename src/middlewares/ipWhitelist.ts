import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import dotenv from '../config/dotenv';

// Load whitelisted IPs from environment variables or use a default list
const whitelistedIPs = dotenv.whitelistIps
  ? dotenv.whitelistIps.split(',').map((ip) => ip.trim())
  : ['192.168.1.1', '203.0.113.0'];

export const ipWhitelist = (req: Request, res: Response, next: NextFunction): void => {
  // Extract IP(s) from 'x-forwarded-for' header or use req.ip
  const forwardedFor = req.headers['x-forwarded-for'];
  const requestIP = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || req.ip; //

  console.log('requestIP', {
    requestIP,
    forwardedFor,
    reqIp: req.ip,
    headers: req.headers,
    whitelistedIPs,
  });

  logger.info(`Incoming request from IP: ${requestIP}`);

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
