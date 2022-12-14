module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      userName: String,
      name: String,
      phoneNumber: String,
      password: String,
      gender: String,
      userRole: String,
      activated: Boolean
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const User = mongoose.model("user", schema);

  return User;
};
