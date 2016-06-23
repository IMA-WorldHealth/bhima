/**
 * Created by Dedrick Kitamuka on 23/06/2016.
 */
describe('component : bhBreadCrumb', function () {
    var component, breadCrumb = {
            path : [
                { label: 'path1', link: '#/path1_link_to_go' },
                { label: 'path2', link: '#/path2_link_to_go' },
                { label: 'path3', link: '#/path3_link_to_go', current: true }
            ],

            button : [
                { icon: 'glyphicon glyphicon-print', label: 'Print', action: function (){return 'Print';} },
                { icon: 'glyphicon glyphicon-repeat', label: 'Repeat', action: function () { return 'Repeat';}, color: 'btn-danger' },
                { icon: 'glyphicon glyphicon-refresh', label: 'Refresh', action: function (){return 'Refresh';}}
            ],

            label : [
                { icon: 'glyphicon glyphicon-print', label: 'My Label 1' },
                { label: 'My label 2' },
                { label: 'My label 3' }
            ],

            dropdown : [
                {
                    label : 'Dropdown 1',
                    color : 'btn-primary',
                    option : [
                        { label : 'Fc', action : function (item){ return item.label;} },
                        { label : '$', action : function (item) {return item.label;} }
                    ]
                },

                {
                    label : 'Dropdown 2',
                    color : 'btn-success',
                    option : [
                        { label : 'item1 dd2 with a too long text that you can imagine', action : function (item){ return item.label;} },
                        { label : 'item2 dd2', action : function (item){ return item.label;}}
                    ]
                }
            ]
        };

    beforeEach(() => {
        module('pascalprecht.translate');
        module('ngStorage');
        module('angularMoment');
        module('bhima.services');
        module('bhima.components');
    });

    beforeEach(inject(function (_$componentController_){
        component = _$componentController_('bhBreadcrumb', null, {
            label : breadCrumb.label,
            button : breadCrumb.button,
            dropdown : breadCrumb.dropdown,
            path : breadCrumb.path
        });
    }));

    it('receives path data correctly', function (){
        expect(component.path.length).to.be.equal(3);
    });

    it('receives button data correctly', function (){
        expect(component.button.length).to.be.equal(3);
    });

    it('receives label data correctly', function (){
        expect(component.label.length).to.be.equal(3);
    });

    it('receives dropdown data correctly', function (){
        expect(component.dropdown.length).to.be.equal(2);
    });
    
    it('switches dropdown choice correctly', function () {
        var dropDownItemFc =  component.dropdown[0].option[0];
        
        component.helperDropdown(dropDownItemFc, component.dropdown);
        expect(component.dropDownItemSelectedLabel).to.be.equal('Fc');
    });
});