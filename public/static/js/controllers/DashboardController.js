vistagrid.controller('DashboardController',
	['$scope', 'PhotoService', 'Upload', 'AuthService', '$rootScope', '$location', '$cookies',
	function ($scope, PhotoService, Upload, AuthService, $rootScope, $location, $cookies) {
		var clickedPhotoID = null;
		$scope.dashboardInstructions = {
			noUploads: 'To get started, upload some photos',
			hasUploads: 'Click on an uploaded photo to begin'
		};
		$(".dropdown-button").dropdown();
		$(document).ready(function(){
		    $('ul.tabs').tabs();
		 });

		var fetchUploads = function () {
			PhotoService.Uploads.getAll().$promise.then(
				function (response) {
					$scope.uploads = response;
				},
				function (error) {
					console.log(error);
				}
			);
		};

		var checkLogin = function () {
			AuthService.loginStatus.get().$promise.then(
				function (response) {
					$cookies.put('isLoggedIn', true);
					$rootScope.showLogoutButton = true;
					fetchUploads();
					$scope.username = response.username;
					$scope.profile_picture = 'https://graph.facebook.com/' + response.uid + '/picture'
				},
				function (error) {
					$location.path('/');
					var $toastContent = $('<span style="font-weight: bold">Please login via Facebook.</span>');
					Materialize.toast($toastContent, 5000);
				}
			);
		};
		checkLogin();

		var refreshThumbnails = function () {
			PhotoService.Thumbnails.getAll().$promise.then(
				function (response) {
					$scope.thumbnails = response;
				},
				function (error) {

				}
			);
		};

		$scope.uploadClicked = function (photo_id, path) {
			$scope.loadingThumbnails = true;
			$scope.uploadPhotoClicked = true;
			$scope.editClicked = false;
			var data = {
				photo_id: photo_id
			};
			clickedPhotoID = photo_id;

			PhotoService.Uploads.getOne(data).$promise.then(
				function (response) {
					$scope.showMain = true;
					$scope.clickedPhoto = response;
				},
				function (error) {

				}
			);
			data = {
				path: path
			};
			PhotoService.Thumbnails.create(data).$promise.then(
				function (response) {
					refreshThumbnails();
					$scope.loadingThumbnails = false;
				},
				function (error) {
					console.log(error);
				}
			);
		};

		$scope.uploadNewPhoto = function (file, errFiles) {
			$scope.uploadInProgress = true;
			if (file) {
				var data = {
					url: '/api/photos/',
					data: {
						path: file,
						filter_effects: 'BLUR'
					}
				}
				Upload.upload(data).then(
					function (response) {
						$scope.uploadInProgress = false;
						fetchUploads();
						var $toastContent = $('<span style="font-weight: bold">Photo uploaded!</span>');
						Materialize.toast($toastContent, 5000);
					},
					function (error) {
						$scope.uploadInProgress = false;
						console.log(error);
						var $toastContent = $('<span style="font-weight: bold">Photo not uploaded!</span>');
						Materialize.toast($toastContent, 5000);
					}
				);
			}
		};

		$scope.effectPreview = function (effectID) {
			var data = {
				effect_id: effectID
			}
			PhotoService.Thumbnails.getOne(data).$promise.then(
				function (response) {
					$scope.clickedPhoto = response;
				},
				function (error) {

				}
			);
		};

		$scope.saveEdits = function () {
			if ($scope.clickedPhoto.effect_name) {
				swal(
					{
						title: "Are you sure?",
						text: "You cannot undo the changes you are about to make!",
						type: "warning",
						showCancelButton: true,
						confirmButtonColor: "#424242",
						confirmButtonText: "Yes, save!",
						closeOnConfirm: true
					},
					function () {
						effect_name = $scope.clickedPhoto.effect_name
						var data = {
							photo_id: clickedPhotoID,
							filter_effects: effect_name
						};
						PhotoService.Uploads.edit(data).$promise.then(
							function (response) {
								fetchUploads();
								var $toastContent = $('<span style="font-weight: bold">' + effect_name + ' effect applied!</span>');
								Materialize.toast($toastContent, 5000);
							},
							function (error) {
								console.log(error);
							}
						);
					}
				);
			} else {
				var $toastContent = $('<span style="font-weight: bold">No effect selected!</span>');
				Materialize.toast($toastContent, 5000);
			}
		};

		$scope.deletePhoto = function () {
			swal(
				{
					title: "Are you sure?",
					text: "You will not be able to recover this photo!",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#f44336",
					confirmButtonText: "Yes, delete photo!",
					closeOnConfirm: true
				},
				function () {
					var data = {
						photo_id: clickedPhotoID
					};
					PhotoService.Uploads.delete(data).$promise.then(
						function (response) {
							$scope.uploadPhotoClicked = false;
							fetchUploads();
							var $toastContent = $('<span style="font-weight: bold">Delete successful!</span>');
							Materialize.toast($toastContent, 5000);
						},
						function (error) {
							var $toastContent = $('<span style="font-weight: bold">An error occurred!</span>');
							Materialize.toast($toastContent, 5000);
						}
					);
				}
			);
		};

		$scope.shareViaFacebook = function () {
			FB.ui(
				{
				 	method: 'share',
				 	href: $scope.clickedPhoto.path,
				},
				function (response) {

				}
			);
		};

		$scope.logout = function () {
			$cookies.remove('isLoggedIn');
			$rootScope.showLogoutButton = false;
		};

		$scope.getRecentEdits = function () {
			PhotoService.PhotoEdit.getAll().$promise.then(
				function (response) {
					$scope.recentEdits = response;
				},
				function (error) {
					console.log(error);
				}
			);
		}

		$scope.recentEditClicked = function (edit_id) {
			var data = {
				edit_id: edit_id
			};

			$scope.editClicked = true;
			$scope.uploadPhotoClicked = false;
			PhotoService.PhotoEdit.getOne(data).$promise.then(
				function (response) {
					$scope.amsterdam = response;
				},
				function (error) {
					console.log(error);
				}
			);
		};
}]);