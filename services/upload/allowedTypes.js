const allowedTypesFunc = async (fileMimetype) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(fileMimetype)) {
        return res.status(400).json({ error: 'Invalid file type' });
    }
    return allowedTypes;
}
module.exports = { allowedTypesFunc }