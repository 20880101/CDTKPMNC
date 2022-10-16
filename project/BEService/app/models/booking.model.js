module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      userId: String,
      address: String,
      lng: String,
      lat: String,
      carType: String,
      finished: Boolean
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Booking = mongoose.model("booking", schema);

  return Booking;
};
