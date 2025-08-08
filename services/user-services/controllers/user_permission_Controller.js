const Joi = require("joi");

const User_Permission = require("../../../models/user_permission");

const user_permission_Controller = {
    create_user_permission: {
        validation: Joi.object({
            user_id: Joi.string().required(),
            permission_ids: Joi.array().items(Joi.string()).required(),
        }),

        handler: async (req, res) => {
            const { user_id, permission_ids } = req.body;

            try {
                // Step 1: Fetch all existing permissions for the user
                const existingPermissions = await User_Permission.findAll({
                    where: { user_id },
                    attributes: ['permission_id', 'allowed']
                });

                const existingMap = {};
                existingPermissions.forEach(p => {
                    existingMap[p.permission_id] = p;
                });

                // Step 2: Determine which permission_ids to allow
                const toAllow = permission_ids;

                // Step 3: Determine which permission_ids to disable (not in the new list)
                const toDisable = existingPermissions
                    .filter(p => !toAllow.includes(p.permission_id) && p.allowed === true)
                    .map(p => p.permission_id);

                // Step 4: Update allowed = false for those not in the new list
                if (toDisable.length > 0) {
                    await User_Permission.update(
                        { allowed: false },
                        {
                            where: {
                                user_id,
                                permission_id: toDisable
                            }
                        }
                    );
                }

                // Step 5: Insert or update the allowed permissions
                const recordsToUpsert = toAllow.map(permission_id => ({
                    user_id,
                    permission_id,
                    allowed: true
                }));

                await User_Permission.bulkCreate(recordsToUpsert, {
                    updateOnDuplicate: ['allowed']
                });

                res.status(200).json({
                    success: true,
                    message: 'User permissions updated successfully'
                });

            } catch (error) {
                console.error(error);
                res.status(500).json({
                    success: false,
                    message: 'Server Error',
                    error: error.message
                });
            }
        }
    },
    get_user_permission: {
        handler: async (req, res) => {
            const { id } = req.params;

            try {
                const permissions = await User_Permission.findAll({
                    where: {
                        user_id: id,
                        allowed: true
                    },
                    attributes: ['permission_id']
                });

                res.status(200).json({
                    success: true,
                    message: 'User permissions fetched successfully',
                    permissions
                });

            } catch (error) {
                console.error(error);
                res.status(500).json({
                    success: false,
                    message: 'Server Error',
                    error: error.message
                });
            }
        }
    },
};

module.exports = user_permission_Controller;