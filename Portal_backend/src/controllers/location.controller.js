import { STATES, DISTRICTS, HIGHEST_QUALIFICATIONS, ALLOWED_LANGUAGES } from "../../utils/data.js";

export const getStates = async (req, res) => {
    try {
        // Returns the array of states
        return res.status(200).json(STATES);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching states" });
    }
};

export const getDistrictsByState = async (req, res) => {
    try {
        const { state } = req.params;
        const normalizedState = state.toLowerCase();
        
        const districts = DISTRICTS[normalizedState] || [];
        return res.status(200).json(districts);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching districts" });
    }
};

export const getMetadata = async (req, res) => {
    try {
        // Returns qualifications and languages for the dropdowns
        return res.status(200).json({
            qualifications: HIGHEST_QUALIFICATIONS,
            languages: ALLOWED_LANGUAGES
        });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching metadata" });
    }
};