export const getUsers = (req, res) => {
  res.send('Get all users');
};

export const getUser = (req, res) => {
  res.send(`Get user with ID ${req.params.id}`);
};

export const createUser = (req, res) => {
  res.send('Create a new user');
};

export const updateUser = (req, res) => {
  res.send(`Update user with ID ${req.params.id}`);
};

export const deleteUser = (req, res) => {
  res.send(`Delete user with ID ${req.params.id}`);
};