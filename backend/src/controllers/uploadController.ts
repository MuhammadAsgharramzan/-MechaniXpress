import { Request, Response } from 'express';

export const uploadFile = (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // In production, this URL would be S3/Cloudfront or similar
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: 'File uploaded successfully',
            fileUrl: fileUrl,
            filename: req.file.filename
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
