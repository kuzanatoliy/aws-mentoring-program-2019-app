const createdAt = new Date('2019-10-29T21:30:00');
const updatedAt = new Date('2019-10-29T21:30:00');

module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert('Images', [{
      id: 1,
      fileName: '1.webp',
      createdAt,
      updatedAt,
    }, {
      id: 2,
      fileName: '2.webp',
      createdAt,
      updatedAt,
    }, {
      id: 3,
      fileName: '3.webp',
      createdAt,
      updatedAt,
    }], {}),

  down: queryInterface => queryInterface.bulkDelete('Images', null, {}),
};
