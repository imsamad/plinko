const outputs = [];
const predictionPoints = 300;
const k = 3;

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  outputs.push([dropPosition, bounciness, size, bucketLabel]);
}

function findPrediction(dropPosition, ballSize, bounciness) {
  const dataPoint = [dropPosition, bounciness, ballSize];
  const clonedData = _.cloneDeep(outputs);
  clonedData.unshift(dataPoint);

  const minMaxOutput = minMax(clonedData, 3);
  const [first, ...rest] = minMaxOutput;

  const prediction = knn(rest, first, 3);
  return prediction;
}

function runAnalysis() {
  return;
  const testSetSize = 20;
  const k = 10;
  console.clear();

  _.range(0, 3).forEach((feature) => {
    const data = _.map(outputs, (row) => [row[feature], _.last(row)]);

    const minMaxOutput = minMax(data, 1);
    const [testSet, trainingSet] = splitDataset(minMaxOutput, testSetSize);

    let correct = _.chain(testSet)
      .filter((testPoint) => {
        const prediction = knn(trainingSet, testPoint, k),
          lastPoint = _.last(testPoint);
        // console.log({ prediction, lastPoint });
        return prediction === lastPoint;
      })
      .size()
      .divide(testSetSize)
      .value();
  });
}

function distanceFrom_PP(pointA, pointB) {
  return (
    _.chain(pointA)
      .zip(pointB)
      .map(([a, b]) => (a - b) ** 2)
      .sum()
      .value() ** 0.5
  );
}

function splitDataset(data, testCount) {
  const shuffled = _.shuffle(data);
  const testSet = _.slice(shuffled, 0, testCount);
  const trainingSet = _.slice(shuffled, testCount);
  return [testSet, trainingSet];
}

function knn(outputs, predictionPoint, knn_value) {
  return _.chain(outputs)
    .map((row) => [
      distanceFrom_PP(_.initial(row), _.initial(predictionPoint)),
      _.last(row),
    ])
    .sortBy((row) => row[0])
    .slice(0, knn_value)
    .countBy((row) => row[1])
    .toPairs()
    .sortBy((row) => row[1])
    .last()
    .first()
    .parseInt()
    .value();
}

function minMax(data, featureCount) {
  const clonedData = _.cloneDeep(data);

  for (let j = 0; j < featureCount; j++) {
    const ith_column = clonedData.map((row) => row[j]);

    const min = _.min(ith_column);
    const max = _.max(ith_column);

    for (let i = 0; i < clonedData.length; i++)
      clonedData[i][j] = (clonedData[i][j] - min) / (max - min);

    return clonedData;
  }
}
