import { CompilerSettings } from '../../../types/settings';

export const validateSettings = (settings: CompilerSettings) => {
    const errors: Record<string, string> = {};

    // Validate version
    if (!/^\d+\.\d+\.\d+$/.test(settings.version)) {
        errors.version = 'Invalid version format';
    }

    // Validate optimizer runs
    if (settings.optimizer.enabled &&
        (settings.optimizer.runs < 1 || settings.optimizer.runs > 999999)) {
        errors.runs = 'Runs must be between 1 and 999999';
    }

    return errors;
};
