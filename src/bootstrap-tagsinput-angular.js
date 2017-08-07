(function ($) {
  angular.module('bootstrap-tagsinput', [])
  .directive('bootstrapTagsinput', [function() {

    function getItemProperty(scope, property) {
      if (!property)
        return undefined;

      if (angular.isFunction(scope.$parent[property]))
        return scope.$parent[property];

      return function(item) {
        return item[property];
      };
    }

    return {
      restrict: 'EA',
      scope: {
        model: '=ngModel',
        options: '<?'
      },
      template: '<select multiple></select>',
      replace: false,
      link: function(scope, element, attrs) {
        $(function() {
          if (!angular.isArray(scope.model))
            scope.model = [];

          var select = $('select', element);
          var typeaheadSourceArray = attrs.typeaheadSource ? attrs.typeaheadSource.split('.') : null;
          var typeaheadSource = typeaheadSourceArray ?
              (typeaheadSourceArray.length > 1 ?
                  scope.$parent[typeaheadSourceArray[0]][typeaheadSourceArray[1]]
                  : scope.$parent[typeaheadSourceArray[0]])
              : null;

          select.tagsinput(scope.options || {
            typeahead : angular.isFunction(typeaheadSource) ? {
              source   : typeaheadSource
            } : void 0,
            itemValue: getItemProperty(scope, attrs.itemvalue),
            itemText : getItemProperty(scope, attrs.itemtext),
            maxTags: !isNaN(attrs.maxTags) ? attrs.maxTags : void 0,
            maxChars: !isNaN(attrs.maxChars) ? attrs.maxChars : void 0,
            trimValue: attrs.trimValue === 'true' ? true : false,
            allowDuplicates: attrs.allowDuplicates === 'true' ? true : false,
            confirmKeys : getItemProperty(scope, attrs.confirmkeys) ? JSON.parse(attrs.confirmkeys) : void 0,
            tagClass : angular.isFunction(scope.$parent[attrs.tagclass]) ? scope.$parent[attrs.tagclass] : (angular.isDefined(attrs.tagclass) ? function(item) { return attrs.tagclass; } : void 0)
          });

          for (var i = 0; i < scope.model.length; i++) {
            select.tagsinput('add', scope.model[i]);
          }

          select.on('itemAdded', function(event) {
            if (scope.model.indexOf(event.item) === -1)
              scope.model.push(event.item);
          });

          select.on('itemRemoved', function(event) {
            var idx = scope.model.indexOf(event.item);
            if (idx !== -1)
              scope.model.splice(idx, 1);
          });

          // create a shallow copy of model's current state, needed to determine
          // diff when model changes
          var prev = scope.model.slice();
          scope.$watch("model", function() {
            var added = scope.model.filter(function(i) {return prev.indexOf(i) === -1;}),
                removed = prev.filter(function(i) {return scope.model.indexOf(i) === -1;}),
                i;

            prev = scope.model.slice();

            // Remove tags no longer in binded model
            for (i = 0; i < removed.length; i++) {
              select.tagsinput('remove', removed[i]);
            }

            // Refresh remaining tags
            select.tagsinput('refresh');

            // Add new items in model as tags
            for (i = 0; i < added.length; i++) {
              select.tagsinput('add', added[i]);
            }
          }, true);
        });
      }
    };
  }]);
})(jQuery);