/**
 * Self-signed certificate generation for the log server.
 * Uses the 'selfsigned' npm package to generate proper X.509 certificates.
 */

import * as fs from "fs";
import selfsigned from "selfsigned";

export interface GeneratedCert {
    cert: string;
    key: string;
}

/**
 * Generate a self-signed certificate for HTTPS.
 * The certificate is valid for localhost and common local development hostnames.
 * @param hostname - Optional hostname to include in the certificate (default: localhost)
 * @returns Object containing PEM-encoded certificate and private key
 */
export function generateSelfSignedCert(hostname = "localhost"): GeneratedCert {
    const attrs = [
        {name: "commonName", value: hostname},
        {name: "organizationName", value: "Graphty Log Server"},
        {name: "countryName", value: "US"},
    ];

    const options = {
        keySize: 2048,
        days: 365,
        algorithm: "sha256" as const,
        extensions: [
            {
                name: "basicConstraints",
                cA: false,
            },
            {
                name: "keyUsage",
                keyCertSign: false,
                digitalSignature: true,
                keyEncipherment: true,
            },
            {
                name: "extKeyUsage",
                serverAuth: true,
            },
            {
                name: "subjectAltName",
                altNames: [
                    {type: 2, value: hostname}, // DNS name
                    {type: 2, value: "localhost"},
                    {type: 7, ip: "127.0.0.1"}, // IP address
                    {type: 7, ip: "::1"}, // IPv6 localhost
                ],
            },
        ],
    };

    const pems = selfsigned.generate(attrs, options);

    return {
        cert: pems.cert,
        key: pems.private,
    };
}

/**
 * Check if certificate files exist and are readable.
 * @param certPath - Path to the certificate file
 * @param keyPath - Path to the private key file
 * @returns true if both files exist and are readable
 */
export function certFilesExist(certPath: string, keyPath: string): boolean {
    try {
        fs.accessSync(certPath, fs.constants.R_OK);
        fs.accessSync(keyPath, fs.constants.R_OK);
        return true;
    } catch {
        return false;
    }
}

/**
 * Read certificate and key from files.
 * @param certPath - Path to the certificate file
 * @param keyPath - Path to the private key file
 * @returns Object containing PEM-encoded certificate and private key
 */
export function readCertFiles(certPath: string, keyPath: string): GeneratedCert {
    return {
        cert: fs.readFileSync(certPath, "utf-8"),
        key: fs.readFileSync(keyPath, "utf-8"),
    };
}
