angular.module('ForemanPipeline.jobs').controller('JobDetailsPathsController', 
    ['$scope', '$q', 'translate', 'Nutupane', 'Org', 'Organization', 'Job', 'CurrentOrganization', 
    function ($scope, $q, translate, Nutupane, Org, Organization, Job, CurrentOrganization) {

        $scope.successMessages = [];
        $scope.errorMessages = [];

        $scope.job = $scope.job || Job.get({id: $scope.$stateParams.jobId}, function () {
            $scope.panel.loading = false;
        });

        var params = {
            id: $scope.$stateParams.jobId
        };

        var nutupane = new Nutupane(Job, params, 'currentPaths');
        $scope.nutupane = nutupane;
        $scope.pathsTable = nutupane.table;


        $scope.removePaths = function () {
            var success,
                error,
                deferred = $q.defer(),
                data = {
                    'path_ids': _.pluck($scope.pathsTable.getSelected(), 'id')
                }

            success = function (response) {
                $scope.successMessages.push(translate('Removed %x Environment Path from job %y.')
                    .replace('%x', data.path_ids.length)
                    .replace('%y', $scope.job.name));
                $scope.pathsTable.working = false;
                $scope.pathsTable.selectAll(false);
                deferred.resolve(response);
            };

            error = function (response) {
                deferred.reject(response.data.errors);
                angular.forEach(response.data.errors, function (errorMessage, key) {
                        if (angular.isString(key)) {
                            errorMessage = [key, errorMessage].join(' ');
                        }
                        $scope.errorMessages.push(translate('Error occured while Removing Paths: ') + errorMessage);
                    });
                $scope.pathsTable.working = false;
            };

            $scope.pathsTable.working = true;
            Job.removePaths({id: $scope.job.id}, data, success, error);
            return deferred.promise;
        };

    }
])