const { NODE_ENV } = process.env;

const RT_pattern = {
    httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
}

module.export = RT_pattern;